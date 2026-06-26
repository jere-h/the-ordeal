import { el } from './dom';
import { JournalStore } from './journal';
import { PullMeter } from './pull';
import type { StoryEngine } from './story';

/** Final screen: two scores + trade-off readout, reflection capture, and the
 *  Ordeal-#2 pull CTA. Renders only what the engine has accumulated; no network. */
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
    card.appendChild(el('p', 'passage', this.engine.currentText()));

    const scores = el('div', 'scores');
    scores.appendChild(
      this.axis('Survivability', survivability, max.survivability, 'Kept you employed, trusted, and out of the crossfire.'),
    );
    scores.appendChild(
      this.axis('Self-Advocacy', self_advocacy, max.self_advocacy, 'Protected your credit, your boundaries, and your judgment.'),
    );
    card.appendChild(scores);

    card.appendChild(el('p', 'tradeoff', this.tradeoff(survivability, self_advocacy)));

    // Reflection — kept client-side only.
    const label = el('label', 'reflect-label', 'Which moment surprised you most about this?');
    const ta = el('textarea', 'reflect') as HTMLTextAreaElement;
    ta.rows = 3;
    ta.value = this.journal.read();
    ta.setAttribute('aria-label', 'Which moment surprised you most about this?');
    ta.addEventListener('input', () => this.journal.write(ta.value));
    // Flush the pending note if the tab is hidden/closed within the debounce
    // window, so the tail of a reflection isn't lost.
    window.addEventListener('pagehide', () => this.journal.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.journal.flush();
    });
    card.appendChild(label);
    card.appendChild(ta);

    // Behavioral pull signal.
    const cta = el('button', 'cta', 'Would you play Ordeal #2?') as HTMLButtonElement;
    cta.type = 'button';
    const teaser = el(
      'p',
      'teaser hidden',
      'Ordeal #2 — "the dashboard nobody used." Six weeks of your work, quietly killed. Coming soon.',
    );
    cta.addEventListener('click', () => {
      this.pull.recordCtaClick();
      teaser.classList.remove('hidden');
      cta.disabled = true;
      cta.textContent = 'Noted — thanks.';
    });
    card.appendChild(cta);
    card.appendChild(teaser);

    this.root.appendChild(card);
  }

  private axis(name: string, value: number, max: number, blurb: string): HTMLElement {
    const denom = Math.max(1, max); // never divide a bar into zero segments
    const wrap = el('div', 'axis');
    const head = el('div', 'axis-head');
    head.appendChild(el('span', 'axis-name', name));
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
      return 'You bought yourself standing and calm — at the cost of fully protecting your own judgment. A survivable move. Notice what it asked you to swallow.';
    }
    if (a > s) {
      return 'You protected your judgment and your credit — and spent some political cover to do it. A principled move. Notice what it cost you in the room.';
    }
    return 'You split the difference — covered yourself and stayed on record. The balanced move. Notice that it still meant giving something up.';
  }
}
