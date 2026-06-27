import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';
import { stanceFor, leanOf } from './result';

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

  it('renders an illustrative, aria-hidden CSS-art band (with figure layers) for the motif', () => {
    render(new StoryEngine(ordeal1), ctx()).render();
    const band = root.querySelector('.scene-art');
    expect(band).not.toBeNull();
    expect(band?.classList.contains('scene-art--data-reveal')).toBe(true); // ordeal1 setup motif
    expect(band?.getAttribute('aria-hidden')).toBe('true');
    // the band is the card's first child — the illustration above the beat indicator
    expect(root.querySelector('.card')?.firstElementChild).toBe(band);
    // the two inner span layers the motif CSS draws its figures from
    expect(band?.querySelector('.scene-art-a')).not.toBeNull();
    expect(band?.querySelector('.scene-art-b')).not.toBeNull();
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

    // (5,2) leans survival → a named stance, a marker left of centre, raw demoted.
    expect(root.querySelector('.stance-name')?.textContent).toBe('The Diplomat');
    const left = parseFloat((root.querySelector('.meter-marker') as HTMLElement).style.left);
    expect(left).toBeGreaterThan(0);
    expect(left).toBeLessThan(50); // left of centre = leaned to survivability
    expect(root.querySelector('.raw')?.textContent).toContain('survivability 5');
    expect(root.querySelector('.raw')?.textContent).toContain('self-advocacy 2');
    expect(root.querySelector('.axis-value')).toBeNull(); // the misleading "N / 6" grade is gone

    // The roads not taken are plotted as faint ghost marks (the scene's spread).
    expect(root.querySelectorAll('.meter-ghost').length).toBeGreaterThan(1);

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

/** The trade-off readout: one spectrum, named zones — not two seesawing grades. */
describe('stance mapping (trade-off spectrum)', () => {
  it('normalizes lean to [-1, 1] and guards a zero total', () => {
    expect(leanOf(6, 0)).toBe(-1);
    expect(leanOf(0, 6)).toBe(1);
    expect(leanOf(3, 3)).toBe(0);
    expect(leanOf(0, 0)).toBe(0); // defensive: no divide-by-zero
  });

  it('names each zone of the spectrum from the real path totals', () => {
    expect(stanceFor(6, 0).name).toBe('The Operator'); // hard survival lean
    expect(stanceFor(5, 1).name).toBe('The Operator');
    expect(stanceFor(5, 2).name).toBe('The Diplomat'); // clear survival lean
    expect(stanceFor(4, 3).name).toBe('The Tightrope Walker'); // near-tie
    expect(stanceFor(3, 3).name).toBe('The Tightrope Walker');
    expect(stanceFor(3, 4).name).toBe('The Tightrope Walker'); // near-tie
    expect(stanceFor(2, 5).name).toBe('The Straight Shooter'); // clear advocacy lean
    expect(stanceFor(0, 6).name).toBe('The Hardliner'); // hard advocacy lean
  });

  it('the survivability and self-advocacy extremes get different names', () => {
    expect(stanceFor(6, 0).name).not.toBe(stanceFor(0, 6).name);
  });
});
