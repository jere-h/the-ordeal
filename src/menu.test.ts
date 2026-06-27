import { beforeEach, describe, expect, it } from 'vitest';
import { ordeals } from './scenes';
import { MenuScreen } from './menu';

/** The landing page lists every story and lets the player choose one to play. */
describe('MenuScreen (landing / story picker)', () => {
  let root: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
    root = document.getElementById('app')!;
  });

  it('lists every ordeal as a selectable story, in order, with its title', () => {
    new MenuScreen(root, { onSelect: () => {} }).show();

    const items = root.querySelectorAll('button.menu-item');
    expect(items).toHaveLength(ordeals.length);

    const titles = [...root.querySelectorAll('.menu-item-title')].map((n) => n.textContent);
    expect(titles).toEqual(ordeals.map((o) => o.title));
  });

  it('shows each story’s blurb when one is authored', () => {
    new MenuScreen(root, { onSelect: () => {} }).show();
    const blurbs = [...root.querySelectorAll('.menu-item-blurb')].map((n) => n.textContent);
    expect(blurbs).toEqual(ordeals.filter((o) => o.blurb).map((o) => o.blurb));
  });

  it('invokes onSelect with the chosen story index', () => {
    const picks: number[] = [];
    new MenuScreen(root, { onSelect: (i) => picks.push(i) }).show();

    (root.querySelectorAll('button.menu-item')[2] as HTMLButtonElement).click();
    expect(picks).toEqual([2]);
  });
});
