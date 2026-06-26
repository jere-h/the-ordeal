import { el } from './dom';
import { renderBlocks } from './blocks';
import { JournalStore } from './journal';
import { PullMeter } from './pull';
import type { StoryEngine } from './story';

/** Inline SVG axis glyphs (shield = survivability, megaphone = self-advocacy). */
const AXIS_ICON: Record<string, string> = {
  survivability:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z"/></svg>',
  self_advocacy:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1zM14 8a4 4 0 0 1 0 8M16.5 5a8 8 0 0 1 0 14"/></svg>',
};

/** Final screen: two scored axes + trade-off readout and a client-side reflection
 *  capture. Renders only what the engine accumulated; no network, no CTA. */
export class ResultScreen {
  private readonly journal = new JournalStore('ordeal1-reflection');
  private readonly pull = new PullMeter('ordeal1-pull');

  constructor(private readonly root: HTMLElement, private readonly engine: StoryEngine) {}

  show(): void {
    this.pull.recordPlay();
    const { survivability, self_advocacy } = this.engine.scores();
    const max = this.engine.maxScores();

    this.root.innerHTML = '';
    const card = el('section', 'card result');

    const outcome = el('div', 'outcome');
    renderBlocks(outcome, this.engine.currentBlocks());
    card.appendChild(outcome);

    const scores = el('div', 'scores');
    scores.appendChild(
      this.axis('survivability', 'Survivability', survivability, max.survivability, 'Kept you employed, trusted, out of the crossfire.'),
    );
    scores.appendChild(
      this.axis('self_advocacy', 'Self-Advocacy', self_advocacy, max.self_advocacy, 'Protected your credit, boundaries, and judgment.'),
    );
    card.appendChild(scores);

    card.appendChild(el('p', 'tradeoff', this.tradeoff(survivability, self_advocacy)));

    // Reflection — kept client-side only.
    const label = el('label', 'reflect-label', 'Which moment landed hardest?');
    const ta = el('textarea', 'reflect') as HTMLTextAreaElement;
    ta.rows = 2;
    ta.value = this.journal.read();
    ta.setAttribute('aria-label', 'Which moment landed hardest?');
    ta.addEventListener('input', () => this.journal.write(ta.value));
    // Flush the pending note if the tab is hidden/closed within the debounce
    // window, so the tail of a reflection isn't lost.
    window.addEventListener('pagehide', () => this.journal.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.journal.flush();
    });
    card.appendChild(label);
    card.appendChild(ta);

    this.root.appendChild(card);
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
