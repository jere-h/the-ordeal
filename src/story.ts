import type { Deltas, Passage, Scene } from './scenes/types';

/**
 * Thin, format-agnostic driver over a Scene graph. The rest of the app only ever
 * touches this interface (currentText / currentChoices / choose / isEnded /
 * scores), which is the seam at which Ink/inkjs could later replace the scene
 * graph with zero UI changes.
 */
export class StoryEngine {
  private current: string;
  private readonly byId: Map<string, Passage>;
  private readonly acc: Deltas = { survivability: 0, self_advocacy: 0 };

  constructor(scene: Scene) {
    this.byId = new Map(scene.passages.map((p) => [p.id, p]));
    if (!this.byId.has(scene.start)) {
      throw new Error(`Scene start passage '${scene.start}' not found`);
    }
    this.current = scene.start;
  }

  private passage(): Passage {
    const p = this.byId.get(this.current);
    if (!p) throw new Error(`Unknown passage '${this.current}'`);
    return p;
  }

  currentText(): string {
    return this.passage().text;
  }

  currentChoices(): { label: string }[] {
    return (this.passage().choices ?? []).map((c) => ({ label: c.label }));
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
}
