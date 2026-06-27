import { el } from './dom';
import { renderBlocks } from './blocks';
import { JournalStore } from './journal';
import { PullMeter } from './pull';
import { nextTeaser } from './scenes';
import type { StoryEngine } from './story';

/** What the result screen needs to namespace its storage and hand off to the
 *  next ordeal. `nextTitle`/`onNext` are present only when another ordeal follows. */
export interface ResultContext {
  ordealId: string;
  nextTitle?: string;
  onNext?: () => void;
  /** Return to the landing page / story picker. Present whenever the app is menu-driven. */
  onMenu?: () => void;
}

// Flush the in-progress note if the tab is hidden/closed within the debounce
// window, so the tail isn't lost. Wired exactly once for the app's lifetime (not
// per render) and always flushes whichever ordeal's journal is currently on
// screen — so navigating between ordeals doesn't leak listeners.
let activeFlush: (() => void) | null = null;
let flushWired = false;
function wireFlushOnce(): void {
  if (flushWired) return;
  flushWired = true;
  const flush = () => activeFlush?.();
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

/** Inline SVG axis glyphs (shield = survivability, megaphone = self-advocacy). */
const AXIS_ICON: Record<string, string> = {
  survivability:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z"/></svg>',
  self_advocacy:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1zM14 8a4 4 0 0 1 0 8M16.5 5a8 8 0 0 1 0 14"/></svg>',
};

/** Final screen. Order is meaning-first: the outcome prose, then the trade-off
 *  readout, then the two axis bars (a shape of who you were, not a grade), then a
 *  one-tap "which moment hit?" capture and the hand-off. No network. */
export class ResultScreen {
  private readonly journal: JournalStore;
  private readonly pull: PullMeter;

  constructor(
    private readonly root: HTMLElement,
    private readonly engine: StoryEngine,
    private readonly ctx: ResultContext,
  ) {
    this.journal = new JournalStore(`${ctx.ordealId}-reflection`);
    this.pull = new PullMeter(`${ctx.ordealId}-pull`);
  }

  show(): void {
    this.pull.recordPlay();
    const { survivability, self_advocacy } = this.engine.scores();

    this.root.innerHTML = '';
    const card = el('section', 'card result');

    // 1. The outcome prose is the payoff — give it the top of the card and room.
    const outcome = el('div', 'outcome');
    renderBlocks(outcome, this.engine.currentBlocks());
    card.appendChild(outcome);

    // 2. Where you stood — a named stance on ONE trade-off spectrum, not two
    //    seesawing grades. (The axes are anti-correlated by design, so the honest
    //    signal is which way you leaned, not two independent scores.)
    card.appendChild(this.stancePanel(survivability, self_advocacy));

    // 3. One-tap "which moment hit?" — no forced essay.
    card.appendChild(this.reflection());

    // 4. A quiet replay hook — the pale marks above are the roads you didn't take.
    card.appendChild(el('p', 'replay-hint', 'The pale marks are the other seven endings. You only got this one.'));

    // 6. Hand off to the next ordeal, or tease that the run continues later.
    if (this.ctx.nextTitle && this.ctx.onNext) {
      const next = el('button', 'next', `Next ordeal → ${this.ctx.nextTitle}`) as HTMLButtonElement;
      next.type = 'button';
      next.addEventListener('click', () => {
        this.pull.recordCtaClick(); // the headline pull signal: did finishing pull you onward?
        this.journal.flush();
        this.ctx.onNext!();
      });
      card.appendChild(next);
    } else {
      card.appendChild(el('p', 'teaser', nextTeaser));
    }

    // Always offer a route back to the story picker when the app is menu-driven.
    if (this.ctx.onMenu) {
      const menu = el('button', 'menu-link', '← All stories') as HTMLButtonElement;
      menu.type = 'button';
      menu.addEventListener('click', () => {
        this.journal.flush();
        this.ctx.onMenu!();
      });
      card.appendChild(menu);
    }

    this.root.appendChild(card);
  }

  /** "Which moment hit hardest?" — one tap on a real beat, optional note. Falls
   *  back to a free-text box for any scene that didn't author `moments`. */
  private reflection(): HTMLElement {
    const wrap = el('div', 'reflect-block');
    wrap.appendChild(el('p', 'reflect-label', 'Which moment hit hardest?'));

    const moments = this.engine.moments();
    if (moments.length === 0) return this.freeTextFallback(wrap);

    const saved = this.readMoment();
    const ack = el('p', 'moment-ack', saved ? "— that's the one that stays." : '');
    const chips = el('div', 'moment-chips');
    moments.forEach((m) => {
      const chip = el('button', 'moment-chip', m) as HTMLButtonElement;
      chip.type = 'button';
      const on = m === saved;
      if (on) chip.classList.add('selected');
      chip.setAttribute('aria-pressed', String(on));
      chip.addEventListener('click', () => {
        this.writeMoment(m);
        chips.querySelectorAll('.moment-chip').forEach((c) => {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');
        ack.textContent = "— that's the one that stays.";
      });
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);
    wrap.appendChild(ack);

    // Optional, collapsed note — there if you want it, never in the way.
    const note = el('details', 'note-toggle');
    note.appendChild(el('summary', 'note-summary', 'add a note (optional)'));
    note.appendChild(this.noteBox());
    wrap.appendChild(note);
    return wrap;
  }

  /** Scenes with no authored moments keep the original free-text prompt. */
  private freeTextFallback(wrap: HTMLElement): HTMLElement {
    wrap.appendChild(this.noteBox());
    return wrap;
  }

  private noteBox(): HTMLTextAreaElement {
    const ta = el('textarea', 'reflect') as HTMLTextAreaElement;
    ta.rows = 2;
    ta.value = this.journal.read();
    ta.setAttribute('aria-label', 'Add a note about the moment that hit hardest');
    ta.addEventListener('input', () => this.journal.write(ta.value));
    activeFlush = () => this.journal.flush();
    wireFlushOnce();
    return ta;
  }

  private readMoment(): string {
    try {
      return localStorage.getItem(`${this.ctx.ordealId}-moment`) ?? '';
    } catch {
      return '';
    }
  }

  private writeMoment(moment: string): void {
    try {
      localStorage.setItem(`${this.ctx.ordealId}-moment`, moment);
    } catch {
      /* private mode / storage disabled — the capture is best-effort only */
    }
  }

  /** The named stance + the single trade-off spectrum, with the other endings
   *  plotted as faint marks so the player sees their choice as one fork. */
  private stancePanel(s: number, a: number): HTMLElement {
    const stance = stanceFor(s, a);
    const mine = leanOf(s, a);

    const panel = el('div', 'stance');
    panel.appendChild(el('p', 'stance-name', stance.name));
    panel.appendChild(el('p', 'stance-line', stance.line));

    const meter = el('div', 'meter');
    meter.setAttribute('role', 'img');
    meter.setAttribute('aria-label', `Where you stood: ${stance.name} — ${leanLabel(mine)}.`);

    meter.appendChild(this.meterEnd('survivability', 'Survivability', 'left'));

    const track = el('div', 'meter-track');
    track.appendChild(el('span', 'meter-origin'));
    // The roads not taken: every other ending's position, faint.
    const others = dedupeLeans(this.engine.allPathScores().map((p) => leanOf(p.survivability, p.self_advocacy)));
    for (const lean of others) {
      const ghost = el('span', 'meter-ghost');
      ghost.style.left = `${toPct(lean)}%`;
      track.appendChild(ghost);
    }
    // Your marker — size/glow scales with how decisively you leaned.
    const gap = Math.abs(a - s);
    const marker = el('span', `meter-marker ${gap >= 5 ? 'is-firm' : gap >= 3 ? 'is-clear' : 'is-soft'}`);
    marker.style.left = `${toPct(mine)}%`;
    track.appendChild(marker);
    meter.appendChild(track);

    meter.appendChild(this.meterEnd('self_advocacy', 'Self-Advocacy', 'right'));
    panel.appendChild(meter);

    // The raw integers, kept for the curious but demoted out of the way.
    const raw = el('details', 'raw-toggle');
    raw.appendChild(el('summary', 'note-summary', 'the raw split'));
    raw.appendChild(el('p', 'raw', `survivability ${s} · self-advocacy ${a}`));
    panel.appendChild(raw);

    return panel;
  }

  private meterEnd(key: string, name: string, side: 'left' | 'right'): HTMLElement {
    const end = el('span', `meter-end meter-end--${side}`);
    const ic = el('span', 'axis-icon');
    ic.innerHTML = AXIS_ICON[key] ?? '';
    end.appendChild(ic);
    end.appendChild(el('span', undefined, name));
    return end;
  }
}

/** Lean along the trade-off spectrum: −1 = pure survivability, +1 = pure
 *  self-advocacy, 0 = balanced. Normalized by the total because path sums vary
 *  slightly (5–7) — the honest comparison is which way you tipped, not the raw gap. */
export function leanOf(s: number, a: number): number {
  const total = s + a;
  return total === 0 ? 0 : (a - s) / total;
}

/** Marker position as a left-percentage on the track (0 = far survivability). */
function toPct(lean: number): number {
  return ((lean + 1) / 2) * 100;
}

function leanLabel(lean: number): string {
  if (lean <= -0.15) return 'you leaned toward survivability';
  if (lean >= 0.15) return 'you leaned toward self-advocacy';
  return 'you held the balance';
}

/** Collapse near-identical leans so the ghost marks don't stack into a smudge. */
function dedupeLeans(leans: number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const l of leans) {
    const k = Math.round(l * 50) / 50; // ~2% buckets
    if (!seen.has(k)) {
      seen.add(k);
      out.push(l);
    }
  }
  return out;
}

export interface Stance {
  name: string;
  line: string;
}

/** Where you landed on the spectrum, as a neutral archetype (never a moral
 *  verdict — there is no optimal play) plus the trade-off in one line. Five zones
 *  on the lean; the raw gap is available to callers for the marker's emphasis. */
export function stanceFor(s: number, a: number): Stance {
  const lean = leanOf(s, a);
  if (lean <= -0.5) {
    return {
      name: 'The Operator',
      line: 'You bought standing and calm, and let the record go where it went. The survivable play — and you know exactly what it asked you to swallow.',
    };
  }
  if (lean <= -0.15) {
    return {
      name: 'The Diplomat',
      line: 'You leaned to cover, a hand still on the truth. Mostly safe, mostly liked — and quietly aware of what you traded for it.',
    };
  }
  if (lean < 0.15) {
    return {
      name: 'The Tightrope Walker',
      line: 'You covered yourself and stayed on record, committing to neither. The even-handed move — and it still cost you a little on both sides.',
    };
  }
  if (lean < 0.5) {
    return {
      name: 'The Straight Shooter',
      line: 'You protected your judgment where it counted, and spent a little cover to do it. Principled, with a read on the room.',
    };
  }
  return {
    name: 'The Hardliner',
    line: 'You kept your name on the catch and your judgment whole — and paid for it in political cover. Notice what it cost you in the room.',
  };
}
