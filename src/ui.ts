import { el } from './dom';
import { ResultScreen } from './result';
import type { StoryEngine } from './story';

/** Renders the current passage + up to 4 choice buttons; hands off to the
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
    card.appendChild(el('p', 'passage', this.engine.currentText()));

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
}
