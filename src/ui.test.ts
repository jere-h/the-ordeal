import { beforeEach, describe, expect, it } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';

/** Full DOM play-through in jsdom: render → click a first choice → click the
 *  second-decision choice → click continue → assert the messaged rendering and
 *  the result screen wiring (beat indicator, message bubbles, scores, no CTA). */
describe('UI play-through (DOM)', () => {
  let root: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main id="app"></main>';
    root = document.getElementById('app')!;
  });

  it('renders the setup beat with a data chip and four choice buttons', () => {
    new UIRenderer(root, new StoryEngine(ordeal1)).render();

    expect(root.querySelectorAll('button.choice')).toHaveLength(4);
    // Beat indicator shows the first beat of three.
    expect(root.querySelector('.beat-label')?.textContent).toContain('The mistake · 1 of 3');
    expect(root.querySelectorAll('.beat-dot')).toHaveLength(3);
    expect(root.querySelectorAll('.beat-dot.on')).toHaveLength(1);
    // The bug is rendered as a data chip, not a paragraph.
    expect(root.querySelector('.data-chip')?.textContent).toContain('+12%');
    expect(root.querySelector('.narration')?.textContent).toContain('six weeks in');
  });

  it('renders escalation messages as bubbles and plays through to a result with both axes', () => {
    new UIRenderer(root, new StoryEngine(ordeal1)).render();

    // First decision: "escalate" (index 2) -> the proper-channel escalation beat.
    (root.querySelectorAll('button.choice')[2] as HTMLButtonElement).click();
    expect(root.querySelector('.beat-label')?.textContent).toContain('The escalation · 2 of 3');
    // The manager's pressure arrives as message bubbles (call channel).
    expect(root.querySelectorAll('.msg').length).toBeGreaterThanOrEqual(1);
    expect(root.querySelector('.msg--call')).not.toBeNull();
    const secondDecision = root.querySelectorAll('button.choice');
    expect(secondDecision).toHaveLength(2);

    // Second decision: "defer" (index 0) -> fallout shows one continue button.
    (secondDecision[0] as HTMLButtonElement).click();
    const continueBtns = root.querySelectorAll('button.choice');
    expect(continueBtns).toHaveLength(1);

    // Continue -> result screen.
    (continueBtns[0] as HTMLButtonElement).click();

    const axisNames = [...root.querySelectorAll('.axis-name')].map((n) => n.textContent);
    expect(axisNames).toEqual(['Survivability', 'Self-Advocacy']);
    const axisValues = [...root.querySelectorAll('.axis-value')].map((n) => n.textContent);
    expect(axisValues).toEqual(['5 / 6', '2 / 6']); // escalate -> defer = 5/2, ceilings 6/6

    // Reaching the result counts one play.
    expect(JSON.parse(localStorage.getItem('ordeal1-pull')!).plays).toBe(1);

    // The Ordeal-#2 CTA was removed.
    expect(root.querySelector('button.cta')).toBeNull();
    expect(root.querySelector('.teaser')).toBeNull();
  });
});
