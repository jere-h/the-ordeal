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
    const max = this.engine.maxScores();

    this.root.innerHTML = '';
    const card = el('section', 'card result');

    // 1. The outcome prose is the payoff — give it the top of the card and room.
    const outcome = el('div', 'outcome');
    renderBlocks(outcome, this.engine.currentBlocks());
    card.appendChild(outcome);

    // 2. Meaning before metric: the trade-off readout frames the bars.
    card.appendChild(el('p', 'tradeoff', this.tradeoff(survivability, self_advocacy)));

    // 3. The two axes — a shape, not a score.
    const scores = el('div', 'scores');
    scores.appendChild(
      this.axis('survivability', 'Survivability', survivability, max.survivability, 'Kept you employed, trusted, out of the crossfire.'),
    );
    scores.appendChild(
      this.axis('self_advocacy', 'Self-Advocacy', self_advocacy, max.self_advocacy, 'Protected your credit, boundaries, and judgment.'),
    );
    card.appendChild(scores);

    // 4. One-tap "which moment hit?" — no forced essay.
    card.appendChild(this.reflection());

    // 5. A quiet replay hook — the paths you didn't take are the whole point.
    card.appendChild(el('p', 'replay-hint', 'Seven other versions of this played out. You only get the one you chose.'));

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

  private axis(key: string, name: string, value: number, max: number, blurb: string): HTMLElement {
    const denom = Math.max(1, max); // never divide a bar into zero segments
    const wrap = el('div', 'axis');

    const head = el('div', 'axis-head');
    const nameWrap = el('span', 'axis-name');
    const ic = el('span', 'axis-icon');
    ic.innerHTML = AXIS_ICON[key] ?? '';
    nameWrap.appendChild(ic);
    nameWrap.appendChild(el('span', undefined, name));
    head.appendChild(nameWrap);
    head.appendChild(el('span', 'axis-value', `${value} / ${denom}`));
    wrap.appendChild(head);

    const bar = el('div', 'bar');
    const filled = Math.max(0, Math.min(value, denom)); // clamp to the axis ceiling
    for (let i = 0; i < denom; i++) {
      bar.appendChild(el('span', i < filled ? 'seg filled' : 'seg'));
    }
    wrap.appendChild(bar);
    wrap.appendChild(el('p', 'axis-blurb', blurb));
    return wrap;
  }

  private tradeoff(s: number, a: number): string {
    if (s > a) {
      return 'You bought standing and calm — and gave up some ground on protecting your own judgment. A survivable move. Notice what it asked you to swallow.';
    }
    if (a > s) {
      return 'You protected your judgment and your credit — and spent political cover to do it. A principled move. Notice what it cost you in the room.';
    }
    return 'You split the difference — covered yourself and stayed on record. The balanced move. It still meant giving something up.';
  }
}
