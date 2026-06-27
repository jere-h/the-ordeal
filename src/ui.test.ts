import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';

/** Full DOM play-through in jsdom: render → first choice → second decision →
 *  continue → assert the messaged rendering, scores, and the next-ordeal hand-off.
 *  Tests pass `commitDelayMs: 0` so the commit beat resolves synchronously. */
describe('UI play-through (DOM)', () => {
  let root: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main id="app"></main>';
    root = document.getElementById('app')!;
  });

  const ctx = (over: Record<string, unknown> = {}) => ({ ordealId: 'ordeal1', ...over });
  const render = (engine: StoryEngine, c: ReturnType<typeof ctx>) =>
    new UIRenderer(root, engine, c, { commitDelayMs: 0 });

  it('separates the story thread from a labeled action dock holding the choices', () => {
    render(new StoryEngine(ordeal1), ctx()).render();

    const actions = root.querySelector('.actions');
    expect(actions).not.toBeNull();
    expect(actions?.getAttribute('role')).toBe('group');
    expect(root.querySelector('.actions-label')?.textContent).toBe('Your move');
    // Every choice lives inside the dock, not loose in the reading thread.
    expect(actions?.querySelectorAll('button.choice')).toHaveLength(4);
    expect(root.querySelector('.thread')?.querySelector('button.choice')).toBeNull();
  });

  it('renders hybrid choice labels: a punchy lead with optional detail sub-line', () => {
    render(new StoryEngine(ordeal1), ctx()).render();
    expect(root.querySelector('button.choice .choice-lead')).not.toBeNull();
    expect(root.querySelectorAll('.choice-detail').length).toBeGreaterThan(0);
  });

  it('renders the setup beat with a data chip and four choice buttons', () => {
    render(new StoryEngine(ordeal1), ctx()).render();

    expect(root.querySelectorAll('button.choice')).toHaveLength(4);
    expect(root.querySelector('.beat-label')?.textContent).toContain('The mistake · 1 of 3');
    expect(root.querySelectorAll('.beat-dot')).toHaveLength(3);
    expect(root.querySelectorAll('.beat-dot.on')).toHaveLength(1);
    expect(root.querySelector('.data-chip')?.textContent).toContain('+12%');
    expect(root.querySelector('.narration')?.textContent).toContain('six weeks in');
  });

  it('commits a choice with a beat: fades the unchosen and advances only after the delay', () => {
    vi.useFakeTimers();
    try {
      new UIRenderer(root, new StoryEngine(ordeal1), ctx(), { commitDelayMs: 400 }).render();
      (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click();

      // The picked move locks in, the others fade, and we have NOT advanced yet.
      expect(root.querySelector('.choice--chosen')).not.toBeNull();
      expect(root.querySelectorAll('.choice--faded')).toHaveLength(3);
      expect((root.querySelectorAll('button.choice')[0] as HTMLButtonElement).disabled).toBe(true);
      expect(root.querySelector('.beat-label')?.textContent).toContain('1 of 3');

      vi.advanceTimersByTime(400);
      expect(root.querySelector('.beat-label')?.textContent).toContain('2 of 3');
    } finally {
      vi.useRealTimers();
    }
  });

  function playEscalateDefer(resultCtx: ReturnType<typeof ctx>) {
    render(new StoryEngine(ordeal1), resultCtx).render();
    (root.querySelectorAll('button.choice')[2] as HTMLButtonElement).click(); // ESCALATE
    (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click(); // defer
    (root.querySelectorAll('button.choice')[0] as HTMLButtonElement).click(); // continue
  }

  it('renders escalation messages as bubbles and plays through to a result with both axes', () => {
    render(new StoryEngine(ordeal1), ctx()).render();

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

  it('offers a one-tap moment picker on the result and records the pick (no forced typing)', () => {
    playEscalateDefer(ctx());

    const chips = root.querySelectorAll('button.moment-chip');
    expect(chips.length).toBe(3);
    // The free-text note is opt-in: present but collapsed inside <details>, not forced.
    expect(root.querySelector('details.note-toggle')?.hasAttribute('open')).toBe(false);

    (chips[0] as HTMLButtonElement).click();
    expect(root.querySelectorAll('.moment-chip.selected')).toHaveLength(1);
    expect(localStorage.getItem('ordeal1-moment')).toBe(chips[0].textContent);
    expect(root.querySelector('.moment-ack')?.textContent).toContain('stays');
  });

  it('shows a "Next ordeal →" hand-off that advances and records the CTA pull signal', () => {
    let advanced = false;
    playEscalateDefer(ctx({ nextTitle: 'The wrong number', onNext: () => (advanced = true) }));

    const next = root.querySelector('button.next') as HTMLButtonElement;
    expect(next).not.toBeNull();
    expect(next.textContent).toContain('Next ordeal → The wrong number');
    expect(root.querySelector('.teaser')).toBeNull();

    next.click();
    expect(advanced).toBe(true);
    expect(JSON.parse(localStorage.getItem('ordeal1-pull')!).cta_clicks).toBe(1);
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
