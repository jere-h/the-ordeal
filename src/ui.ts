import { el } from './dom';
import { ResultScreen, type ResultContext } from './result';
import { renderBlocks } from './blocks';
import type { Beat } from './scenes/types';
import type { StoryEngine } from './story';

/** Honor the OS "reduce motion" setting — skip the commit beat's pause for users
 *  who asked for less animation (and degrade safely where matchMedia is absent). */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export interface RenderOptions {
  /** Pause (ms) after a choice is committed — the beat where the picked move
   *  locks in and the unchosen ones fade — before advancing. 0 = advance at once
   *  (used by tests and reduced-motion). */
  commitDelayMs?: number;
}

/** Renders the current passage as a beat indicator + content blocks (messages,
 *  call cards, data chips) + up to 4 reply-style choice buttons; hands off to the
 *  ResultScreen once the engine reaches a terminal passage. */
export class UIRenderer {
  private readonly commitDelayMs: number;

  constructor(
    private readonly root: HTMLElement,
    private readonly engine: StoryEngine,
    private readonly ctx: ResultContext,
    opts: RenderOptions = {},
  ) {
    this.commitDelayMs = opts.commitDelayMs ?? 420;
  }

  render(): void {
    if (this.engine.isEnded()) {
      new ResultScreen(this.root, this.engine, this.ctx).show();
      return;
    }

    this.root.innerHTML = '';
    const card = el('section', 'card');

    // A decorative, in-theme CSS-art band that sets the passage's mood (above the
    // beat indicator). Purely presentational — aria-hidden, drawn entirely in CSS.
    const art = this.engine.currentArt();
    if (art) {
      const band = el('div', `scene-art scene-art--${art}`);
      band.setAttribute('aria-hidden', 'true');
      card.appendChild(band);
    }

    const beat = this.engine.currentBeat();
    if (beat) card.appendChild(this.beatIndicator(beat));

    const thread = el('div', 'thread');
    renderBlocks(thread, this.engine.currentBlocks());
    card.appendChild(thread);

    // The action dock: a visually distinct, labeled zone so the player can tell
    // where the story stops (passive reading, above) and their move starts.
    const actions = el('div', 'actions');
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', 'Your options');
    actions.appendChild(el('p', 'actions-label', 'Your move'));

    const list = el('div', 'choices');
    this.engine.currentChoices().forEach((choice, i) => {
      const button = el('button', 'choice') as HTMLButtonElement;
      button.type = 'button';
      const body = el('div', 'choice-body');
      body.appendChild(el('span', 'choice-lead', choice.label));
      if (choice.detail) body.appendChild(el('span', 'choice-detail', choice.detail));
      button.appendChild(body);
      button.addEventListener('click', () => this.commit(i, list));
      list.appendChild(button);
    });
    actions.appendChild(list);
    card.appendChild(actions);
    this.root.appendChild(card);
  }

  /** Commit a choice: lock in the picked move and fade the roads not taken for a
   *  beat (so the decision is felt, not just a screen-swap), then advance. */
  private commit(index: number, list: HTMLElement): void {
    const buttons = [...list.querySelectorAll('button.choice')] as HTMLButtonElement[];
    buttons.forEach((b, j) => {
      b.disabled = true;
      b.classList.add(j === index ? 'choice--chosen' : 'choice--faded');
    });

    const advance = (): void => {
      this.engine.choose(index);
      this.render();
      this.root.scrollTo?.({ top: 0 });
    };

    if (this.commitDelayMs > 0 && !prefersReducedMotion()) {
      window.setTimeout(advance, this.commitDelayMs);
    } else {
      advance();
    }
  }

  private beatIndicator(beat: Beat): HTMLElement {
    const wrap = el('div', 'beat');
    const dots = el('div', 'beat-dots');
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= beat.of; i++) {
      dots.appendChild(el('span', i <= beat.n ? 'beat-dot on' : 'beat-dot'));
    }
    wrap.appendChild(dots);
    // Phase name carries weight (the three-act spine); the counter is micro-text.
    const label = el('span', 'beat-label');
    label.appendChild(el('span', 'beat-phase', beat.label));
    label.appendChild(el('span', 'beat-count', ` · ${beat.n} of ${beat.of}`));
    wrap.appendChild(label);
    return wrap;
  }
}
