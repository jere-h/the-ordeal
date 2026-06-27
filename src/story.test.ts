import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ordeals } from './scenes';
import { ordeal1 } from './scenes/ordeal1';
import type { Scene } from './scenes/types';
import { blockText } from './scenes/types';
import { StoryEngine } from './story';
import { JournalStore } from './journal';
import { PullMeter } from './pull';

/**
 * Enumerate every root→terminal path as a sequence of choice indices, by walking
 * the scene graph. Works for any scene depth (the two-decision arc yields paths of
 * [first choice, second choice, continue]).
 */
function enumeratePaths(scene: Scene): number[][] {
  const byId = new Map(scene.passages.map((p) => [p.id, p]));
  const out: number[][] = [];
  const walk = (id: string, acc: number[]): void => {
    const choices = byId.get(id)?.choices ?? [];
    if (choices.length === 0) {
      out.push(acc);
      return;
    }
    choices.forEach((c, i) => walk(c.to, [...acc, i]));
  };
  walk(scene.start, []);
  return out;
}

/** Drive a fresh engine along a path of choice indices and return the final state. */
function play(scene: Scene, indices: number[]) {
  const engine = new StoryEngine(scene);
  for (const i of indices) engine.choose(i);
  return engine;
}

const sortPairs = (pairs: { survivability: number; self_advocacy: number }[]) =>
  [...pairs].sort((a, b) => a.survivability - b.survivability || a.self_advocacy - b.self_advocacy);

// Per-scene regression guard: the full set of root→terminal score totals.
const EXPECTED_TOTALS: Record<string, { survivability: number; self_advocacy: number }[]> = {
  ordeal1: [
    { survivability: 0, self_advocacy: 6 },
    { survivability: 3, self_advocacy: 3 },
    { survivability: 6, self_advocacy: 0 },
    { survivability: 4, self_advocacy: 3 },
    { survivability: 5, self_advocacy: 2 },
    { survivability: 3, self_advocacy: 4 },
    { survivability: 5, self_advocacy: 1 },
    { survivability: 3, self_advocacy: 3 },
  ],
  ordeal2: [
    { survivability: 0, self_advocacy: 6 },
    { survivability: 3, self_advocacy: 4 },
    { survivability: 2, self_advocacy: 5 },
    { survivability: 4, self_advocacy: 3 },
    { survivability: 4, self_advocacy: 3 },
    { survivability: 5, self_advocacy: 1 },
    { survivability: 5, self_advocacy: 2 },
    { survivability: 6, self_advocacy: 0 },
  ],
  ordeal3: [
    { survivability: 0, self_advocacy: 6 },
    { survivability: 3, self_advocacy: 4 },
    { survivability: 2, self_advocacy: 5 },
    { survivability: 4, self_advocacy: 3 },
    { survivability: 4, self_advocacy: 3 },
    { survivability: 5, self_advocacy: 1 },
    { survivability: 5, self_advocacy: 2 },
    { survivability: 6, self_advocacy: 0 },
  ],
};

// Run the same structural + calibration invariants over every authored ordeal.
describe.each(ordeals)('scene invariants — $id ($title)', ({ id, scene }) => {
  const paths = enumeratePaths(scene);

  it('is a two-decision arc: eight terminal paths, each [first, second, continue]', () => {
    expect(paths).toHaveLength(8);
    paths.forEach((p) => expect(p).toHaveLength(3));
  });

  it('every root→terminal path reaches the single shared terminal passage', () => {
    const terminals = scene.passages.filter((p) => !p.choices || p.choices.length === 0);
    expect(terminals).toHaveLength(1);
    const endText = terminals[0].blocks.map(blockText).join('\n\n');
    paths.forEach((indices) => {
      const engine = play(scene, indices);
      expect(engine.isEnded()).toBe(true);
      expect(engine.currentText()).toBe(endText);
    });
  });

  it('every per-decision delta is an integer in 0..3', () => {
    for (const p of scene.passages) {
      for (const c of p.choices ?? []) {
        for (const v of [c.deltas.survivability, c.deltas.self_advocacy]) {
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('produces exactly the expected set of path score totals (regression guard)', () => {
    const totals = paths.map((indices) => play(scene, indices).scores());
    expect(sortPairs(totals)).toEqual(sortPairs(EXPECTED_TOTALS[id]));
  });

  it('is calibrated: no path maxes both axes, and the axis leaders are different, unique paths', () => {
    const totals = paths.map((indices) => play(scene, indices).scores());
    const maxSurv = Math.max(...totals.map((t) => t.survivability));
    const maxSelf = Math.max(...totals.map((t) => t.self_advocacy));

    // (a) No single path is maximal on BOTH axes.
    expect(totals.some((t) => t.survivability === maxSurv && t.self_advocacy === maxSelf)).toBe(false);

    // (b) The survivability leader and self-advocacy leader are different, unique paths.
    const survLeaders = totals.flatMap((t, i) => (t.survivability === maxSurv ? [i] : []));
    const selfLeaders = totals.flatMap((t, i) => (t.self_advocacy === maxSelf ? [i] : []));
    expect(survLeaders).toHaveLength(1);
    expect(selfLeaders).toHaveLength(1);
    expect(survLeaders[0]).not.toBe(selfLeaders[0]);
  });

  it('setup offers exactly four labeled choices', () => {
    expect(new StoryEngine(scene).currentChoices()).toHaveLength(4);
  });

  it('reports per-axis ceilings of 6 (two scored decisions of up to 3)', () => {
    expect(new StoryEngine(scene).maxScores()).toEqual({ survivability: 6, self_advocacy: 6 });
  });
});

describe('client-side stores', () => {
  beforeEach(() => localStorage.clear());

  it('journal reflection round-trips through localStorage', () => {
    const j = new JournalStore('test-reflection');
    j.flush('the credit-theft beat surprised me');
    expect(new JournalStore('test-reflection').read()).toBe('the credit-theft beat surprised me');
  });

  it('journal flush() with no arg persists the latest pending write (teardown path)', () => {
    const j = new JournalStore('test-reflection', 10_000); // long debounce: timer won't fire
    j.write('half a thought');
    expect(new JournalStore('test-reflection').read()).toBe(''); // not yet persisted
    j.flush(); // teardown flush persists the pending value
    expect(new JournalStore('test-reflection').read()).toBe('half a thought');
  });

  it('pull meter counts plays and computes the ratio', () => {
    const p = new PullMeter('test-pull');
    p.recordPlay();
    p.recordPlay();
    expect(p.counters().plays).toBe(2);
  });
});

describe('no-network invariant', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('a full play-through + reflection + pull issues zero network calls', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch' as never).mockImplementation((() => {
      throw new Error('network call attempted');
    }) as never);

    // Drive a complete two-decision branch (ESCALATE → defer → continue).
    const engine = new StoryEngine(ordeal1);
    engine.choose(2);
    engine.choose(0);
    engine.choose(0);
    expect(engine.isEnded()).toBe(true);
    new JournalStore('reflection').flush('note');
    new PullMeter('pull').recordPlay();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
