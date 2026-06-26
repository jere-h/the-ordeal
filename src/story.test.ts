import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import type { Scene } from './scenes/types';
import { StoryEngine } from './story';
import { JournalStore } from './journal';
import { PullMeter } from './pull';

/**
 * Enumerate every root→terminal path as a sequence of choice indices, by walking
 * the scene graph. Generalizes the old hard-coded "4 first choices" to the
 * two-decision arc (and any future depth): each terminal path is a full
 * setup→…→result run.
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
function play(indices: number[]) {
  const engine = new StoryEngine(ordeal1);
  for (const i of indices) engine.choose(i);
  return engine;
}

// The full set of root→terminal path totals (regression guard against accidental
// delta edits). Mirrors the per-path table in ordeal1.ts.
const EXPECTED_TOTALS = [
  { survivability: 0, self_advocacy: 6 }, // FIGHT → hold   (Self-Advocacy leader)
  { survivability: 3, self_advocacy: 3 }, // FIGHT → fold
  { survivability: 6, self_advocacy: 0 }, // ABSORB → eat   (Survivability leader)
  { survivability: 4, self_advocacy: 3 }, // ABSORB → reclaim
  { survivability: 5, self_advocacy: 2 }, // ESCALATE → defer
  { survivability: 3, self_advocacy: 4 }, // ESCALATE → record
  { survivability: 5, self_advocacy: 1 }, // DOCUMENT → defer
  { survivability: 3, self_advocacy: 3 }, // DOCUMENT → record
];

const sortPairs = (pairs: { survivability: number; self_advocacy: number }[]) =>
  [...pairs].sort((a, b) => a.survivability - b.survivability || a.self_advocacy - b.self_advocacy);

describe('Ordeal #1 scene', () => {
  const paths = enumeratePaths(ordeal1);

  it('has the expected branch shape (two decisions + a continue, eight terminal paths)', () => {
    expect(paths).toHaveLength(8);
    // Each path is [first choice, second choice, continue-to-result].
    paths.forEach((p) => expect(p).toHaveLength(3));
  });

  it('every root→terminal path reaches the single shared result passage', () => {
    const resultText = ordeal1.passages.find((p) => p.id === 'result')!.text;
    paths.forEach((indices) => {
      const engine = play(indices);
      expect(engine.isEnded()).toBe(true);
      expect(engine.currentText()).toBe(resultText);
    });
  });

  it('produces exactly the expected set of path score totals (regression guard)', () => {
    const totals = paths.map((indices) => play(indices).scores());
    expect(sortPairs(totals)).toEqual(sortPairs(EXPECTED_TOTALS));
  });

  it('is calibrated: no path maxes both axes, and the axis leaders are different, unique paths', () => {
    const totals = paths.map((indices) => play(indices).scores());
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

  it('reports per-axis ceilings matching the leader paths (result-screen denominator)', () => {
    const max = new StoryEngine(ordeal1).maxScores();
    expect(max).toEqual({ survivability: 6, self_advocacy: 6 });
  });

  it('setup offers exactly four labeled choices', () => {
    expect(new StoryEngine(ordeal1).currentChoices()).toHaveLength(4);
  });

  it('each first choice leads to a second decision before any fallout', () => {
    for (let i = 0; i < 4; i++) {
      const engine = new StoryEngine(ordeal1);
      engine.choose(i);
      // The escalation beat is itself a decision (two choices), not a lone continue.
      expect(engine.currentChoices()).toHaveLength(2);
      expect(engine.isEnded()).toBe(false);
    }
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

  it('pull meter counts plays and CTA clicks and computes the ratio', () => {
    const p = new PullMeter('test-pull');
    p.recordPlay();
    p.recordPlay();
    p.recordCtaClick();
    expect(p.counters()).toEqual({ plays: 2, cta_clicks: 1 });
    expect(p.ratio()).toBeCloseTo(0.5);
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
    const meter = new PullMeter('pull');
    meter.recordPlay();
    meter.recordCtaClick();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
