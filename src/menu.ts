import { el } from './dom';
import { ordeals } from './scenes';

/** What the landing page needs: a way to start the chosen story. */
export interface MenuContext {
  onSelect: (index: number) => void;
}

/** The landing page / story picker. Lists every ordeal in the run as a selectable
 *  card so a player chooses what to play instead of being dropped into a fixed
 *  linear sequence. Pure DOM, no network — same contract as the rest of the app. */
export class MenuScreen {
  constructor(
    private readonly root: HTMLElement,
    private readonly ctx: MenuContext,
  ) {}

  show(): void {
    this.root.innerHTML = '';
    const card = el('section', 'card menu');

    card.appendChild(el('h1', 'menu-title', 'The Ordeal'));
    card.appendChild(
      el(
        'p',
        'menu-sub',
        "Scenes from a data analyst's first year — the part no tutorial covers. Pick one. There are no right answers, only revealing ones.",
      ),
    );

    const list = el('div', 'menu-list');
    ordeals.forEach((ordeal, i) => {
      const item = el('button', 'menu-item') as HTMLButtonElement;
      item.type = 'button';
      item.setAttribute('aria-label', `Play: ${ordeal.title}`);

      item.appendChild(el('span', 'menu-num', String(i + 1).padStart(2, '0')));

      const body = el('div', 'menu-item-body');
      body.appendChild(el('span', 'menu-item-title', ordeal.title));
      if (ordeal.blurb) body.appendChild(el('span', 'menu-item-blurb', ordeal.blurb));
      item.appendChild(body);

      item.appendChild(el('span', 'menu-arrow', '→'));

      item.addEventListener('click', () => this.ctx.onSelect(i));
      list.appendChild(item);
    });
    card.appendChild(list);

    this.root.appendChild(card);
  }
}
