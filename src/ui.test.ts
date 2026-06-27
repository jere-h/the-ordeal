import { beforeEach, describe, expect, it } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';

/** Full DOM play-through in jsdom: render → first choice → second decision →
 *  continue → assert the messaged rendering, scores, and the next-ordeal hand-off. */
describe('UI play-through (DOM)', () => {
  let root: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main id="app"></main>';
    root = document.getElementById('app')!;
  });

  const ctx = (over: Record<string, unknown> = {}) => ({ ordealId: 'ordeal1', ...over });

  it('separates the story thread from a labeled action dock holding the choices', () => {
    new UIRenderer(root, new StoryEngine(ordeal1), ctx()).render();

    const actions = root.querySelector('.actions');
    expect(actions).not.toBeNull();
    expect(actions?.getAttribute('role')).toBe('group');
    expect(root.querySelector('.actions-label')?.textContent).toBe('Your move');
    // Every choice lives inside the dock, not loose in the reading thread.
    expect(actions?.querySelectorAll('button.choice')).toHaveLength(4);
    expect(root.querySelector('.thread')?.querySelector('button.choice')).toBeNull();
  });

  it('renders the setup beat with a data chip and four choice buttons', () => {
    new UIRenderer(root, new StoryEngine(ordeal1), ctx()).render();

    expect(root.querySelectorAll('button.choice')).toHaveLength(4);
    expect(root.querySelector('.beat-label')?.textContent).toContain('The mistake · 1 of 3');
    expect(root.querySelectorAll('.beat-dot')).toHaveLength(3);
    expect(root.querySelectorAll('.beat-dot.on')).toHaveLength(1);
    expect(root.querySelector('.data-chip')?.textContent).toContain('+12%');
    expect(root.querySelector('.narration')?.textContent).toContain('six weeks in');
  });

  function playEscalateDefer(resultCtx: ReturnType<typeof ctx>) {
    new UIRenderer(root, new StoryEngine(ordeal1), resultCtx).render();
    (root.querySelectorAll('button.choice')[2] as HTMLButtonElement).click(); // ESCALATE
    (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click(); // defer
    (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click(); // continue
  }

  it('renders escalation messages as bubbles and plays through to a result with both axes', () => {
    new UIRenderer(root, new StoryEngine(ordeal1), ctx()).render();

    (root.querySelectorAll('button.choice')[2] as HTMLButtonElement).click();
    expect(root.querySelector('.beat-label')?.textContent).toContain('The escalation · 2 of 3');
    expect(root.querySelectorAll('.msg').length).toBeGreaterThanOrEqual(1);
    expect(root.querySelector('.msg--call')).not.toBeNull();
    expect(root.querySelectorAll('button.choice')).toHaveLength(2);

    (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click(); // defer
    expect(root.querySelectorAll('button.choice')).toHaveLength(1);
    (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click(); // continue

    const axisNames = [...root.querySelectorAll('.axis-name')].map((n) => n.textContent);
    expect(axisNames).toEqual(['Survivability', 'Self-Advocacy']);
    const axisValues = [...root.querySelectorAll('.axis-value')].map((n) => n.textContent);
    expect(axisValues).toEqual(['5 / 6', '2 / 6']); // escalate -> defer = 5/2, ceilings 6/6

    expect(JSON.parse(localStorage.getItem('ordeal1-pull')!).plays).toBe(1);
    expect(root.querySelector('button.cta')).toBeNull(); // CTA removed
  });

  it('shows a "Next ordeal →" hand-off that advances when there is a next ordeal', () => {
    let advanced = false;
    playEscalateDefer(ctx({ nextTitle: 'The dashboard nobody used', onNext: () => (advanced = true) }));

    const next = root.querySelector('button.next') as HTMLButtonElement;
    expect(next).not.toBeNull();
    expect(next.textContent).toContain('Next ordeal → The dashboard nobody used');
    expect(root.querySelector('.teaser')).toBeNull();

    next.click();
    expect(advanced).toBe(true);
  });

  it('shows the teaser (no hand-off button) when there is no next ordeal', () => {
    playEscalateDefer(ctx()); // no nextTitle/onNext
    expect(root.querySelector('button.next')).toBeNull();
    expect(root.querySelector('.teaser')).not.toBeNull();
  });

  it('offers a "back to menu" control on the result when onMenu is provided', () => {
    let toMenu = false;
    playEscalateDefer(ctx({ onMenu: () => (toMenu = true) }));

    const back = root.querySelector('button.menu-link') as HTMLButtonElement;
    expect(back).not.toBeNull();
    back.click();
    expect(toMenu).toBe(true);
  });

  it('omits the "back to menu" control when no onMenu is wired', () => {
    playEscalateDefer(ctx());
    expect(root.querySelector('button.menu-link')).toBeNull();
  });
});
