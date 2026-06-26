import { el } from './dom';
import { ResultScreen } from './result';
import { renderBlocks } from './blocks';
import type { Beat } from './scenes/types';
import type { StoryEngine } from './story';

/** Renders the current passage as a beat indicator + content blocks (messages,
 *  call cards, data chips) + up to 4 reply-style choice buttons; hands off to the
 *  ResultScreen once the engine reaches a terminal passage. */
export class UIRenderer {
  constructor(private readonly root: HTMLElement, private readonly engine: StoryEngine) {}

  render(): void {
    if (this.engine.isEnded()) {
      new ResultScreen(this.root, this.engine).show();
      return;
    }

    this.root.innerHTML = '';
    const card = el('section', 'card');

    const beat = this.engine.currentBeat();
    if (beat) card.appendChild(this.beatIndicator(beat));

    const thread = el('div', 'thread');
    renderBlocks(thread, this.engine.currentBlocks());
    card.appendChild(thread);

    const list = el('div', 'choices');
    this.engine.currentChoices().forEach((choice, i) => {
      const button = el('button', 'choice', choice.label) as HTMLButtonElement;
      button.type = 'button';
      button.addEventListener('click', () => {
        this.engine.choose(i);
        this.render();
        this.root.scrollTo?.({ top: 0 });
      });
      list.appendChild(button);
    });
    card.appendChild(list);
    this.root.appendChild(card);
  }

  private beatIndicator(beat: Beat): HTMLElement {
    const wrap = el('div', 'beat');
    const dots = el('div', 'beat-dots');
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= beat.of; i++) {
      dots.appendChild(el('span', i <= beat.n ? 'beat-dot on' : 'beat-dot'));
    }
    wrap.appendChild(dots);
    wrap.appendChild(el('span', 'beat-label', `${beat.label} · ${beat.n} of ${beat.of}`));
    return wrap;
  }
}
