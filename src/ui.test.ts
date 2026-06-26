import { beforeEach, describe, expect, it } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';

/** Full DOM play-through in jsdom: render → click a choice → click continue →
 *  assert the result screen wiring (scores, reflection, pull CTA). */
describe('UI play-through (DOM)', () => {
  let root: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main id="app"></main>';
    root = document.getElementById('app')!;
  });

  it('renders the setup with four choice buttons', () => {
    new UIRenderer(root, new StoryEngine(ordeal1)).render();
    const buttons = root.querySelectorAll('button.choice');
    expect(buttons).toHaveLength(4);
    expect(root.querySelector('.passage')?.textContent).toContain('double-counts refunds');
  });

  it('plays a branch through to a result screen with both axes and a working CTA', () => {
    new UIRenderer(root, new StoryEngine(ordeal1)).render();

    // Pick "escalate" (index 2) -> fallout shows one continue button.
    (root.querySelectorAll('button.choice')[2] as HTMLButtonElement).click();
    const continueBtns = root.querySelectorAll('button.choice');
    expect(continueBtns).toHaveLength(1);

    // Continue -> result screen.
    (continueBtns[0] as HTMLButtonElement).click();

    const axisNames = [...root.querySelectorAll('.axis-name')].map((n) => n.textContent);
    expect(axisNames).toEqual(['Survivability', 'Self-Advocacy']);
    const axisValues = [...root.querySelectorAll('.axis-value')].map((n) => n.textContent);
    expect(axisValues).toEqual(['2 / 3', '2 / 3']); // escalate -> 2/2

    // Reaching the result counts one play.
    expect(JSON.parse(localStorage.getItem('ordeal1-pull')!).plays).toBe(1);

    // The pull CTA records a click and reveals the teaser.
    const cta = root.querySelector('button.cta') as HTMLButtonElement;
    expect(root.querySelector('.teaser')?.classList.contains('hidden')).toBe(true);
    cta.click();
    expect(root.querySelector('.teaser')?.classList.contains('hidden')).toBe(false);
    expect(JSON.parse(localStorage.getItem('ordeal1-pull')!).cta_clicks).toBe(1);
    expect(cta.disabled).toBe(true);
  });
});
