import type { Block, Beat, Deltas, Passage, Scene } from './scenes/types';
import { blockText } from './scenes/types';

/**
 * Thin, format-agnostic driver over a Scene graph. The rest of the app only ever
 * touches this interface (currentText / currentChoices / choose / isEnded /
 * scores), which is the seam at which Ink/inkjs could later replace the scene
 * graph with zero UI changes.
 */
export class StoryEngine {
  private current: string;
  private readonly start: string;
  private readonly byId: Map<string, Passage>;
  private readonly _moments: string[];
  private readonly acc: Deltas = { survivability: 0, self_advocacy: 0 };

  constructor(scene: Scene) {
    this.byId = new Map(scene.passages.map((p) => [p.id, p]));
    if (!this.byId.has(scene.start)) {
      throw new Error(`Scene start passage '${scene.start}' not found`);
    }
    this.start = scene.start;
    this.current = scene.start;
    this._moments = scene.moments ?? [];
  }

  private passage(): Passage {
    const p = this.byId.get(this.current);
    if (!p) throw new Error(`Unknown passage '${this.current}'`);
    return p;
  }

  /** The structured content of the current passage, for the renderer. */
  currentBlocks(): Block[] {
    return this.passage().blocks;
  }

  /** Where the current passage sits in the arc (for the progress indicator); undefined on the result. */
  currentBeat(): Beat | undefined {
    return this.passage().beat;
  }

  /** Plain-text flattening of the current passage — accessibility/text fallback and tests. */
  currentText(): string {
    return this.passage().blocks.map(blockText).join('\n\n');
  }

  currentChoices(): { label: string; detail?: string }[] {
    return (this.passage().choices ?? []).map((c) => ({ label: c.label, detail: c.detail }));
  }

  /** The scene's optional one-tap "which moment hit?" chips, for the result screen. */
  moments(): string[] {
    return this._moments;
  }

  /** The current passage's optional CSS-art motif key (for the hero band). */
  currentArt(): string | undefined {
    return this.passage().art;
  }

  choose(index: number): void {
    const choices = this.passage().choices ?? [];
    const choice = choices[index];
    if (!choice) throw new Error(`Invalid choice index ${index} at '${this.current}'`);
    if (!this.byId.has(choice.to)) throw new Error(`Choice targets unknown passage '${choice.to}'`);
    this.acc.survivability += choice.deltas.survivability;
    this.acc.self_advocacy += choice.deltas.self_advocacy;
    this.current = choice.to;
  }

  isEnded(): boolean {
    return (this.passage().choices ?? []).length === 0;
  }

  scores(): Deltas {
    return { ...this.acc };
  }

  /**
   * Every root→terminal path's total — the full spread of outcomes the scene can
   * produce. The result screen plots these as faint "roads not taken" marks on the
   * trade-off spectrum, so the player sees their choice as one fork among the
   * others (no invented per-player stats — just the scene's own geometry).
   */
  allPathScores(): Deltas[] {
    const out: Deltas[] = [];
    const walk = (id: string, acc: Deltas): void => {
      const choices = this.byId.get(id)?.choices ?? [];
      if (choices.length === 0) {
        out.push(acc);
        return;
      }
      for (const c of choices) {
        walk(c.to, {
          survivability: acc.survivability + c.deltas.survivability,
          self_advocacy: acc.self_advocacy + c.deltas.self_advocacy,
        });
      }
    };
    walk(this.start, { survivability: 0, self_advocacy: 0 });
    return out;
  }

  /**
   * The maximum value reachable on each axis across all root→terminal paths —
   * the scene's per-axis ceiling, computed independently per axis (the
   * survivability-max path and self_advocacy-max path need not be the same path).
   * The result screen uses this as the score denominator so the bars stay honest
   * as scenes grow from one scored decision (0..3) to several (0..N) without a
   * magic constant. Memoized DFS over the DAG; throws on a cycle.
   */
  maxScores(): Deltas {
    const memo = new Map<string, Deltas>();
    const onStack = new Set<string>();
    const best = (id: string): Deltas => {
      const cached = memo.get(id);
      if (cached) return cached;
      if (onStack.has(id)) throw new Error(`Cycle detected at passage '${id}'`);
      const p = this.byId.get(id);
      if (!p) throw new Error(`Unknown passage '${id}'`);
      onStack.add(id);
      const acc: Deltas = { survivability: 0, self_advocacy: 0 };
      for (const c of p.choices ?? []) {
        const sub = best(c.to);
        acc.survivability = Math.max(acc.survivability, c.deltas.survivability + sub.survivability);
        acc.self_advocacy = Math.max(acc.self_advocacy, c.deltas.self_advocacy + sub.self_advocacy);
      }
      onStack.delete(id);
      memo.set(id, acc);
      return acc;
    };
    return best(this.start);
  }
}
