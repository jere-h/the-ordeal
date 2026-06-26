import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { JournalStore } from './journal';
import { PullMeter } from './pull';

// The four first-choice indices and the exact score pair each should yield.
const EXPECTED = [
  { choice: 'fight back', survivability: 0, self_advocacy: 3 },
  { choice: 'absorb', survivability: 3, self_advocacy: 0 },
  { choice: 'escalate', survivability: 2, self_advocacy: 2 },
  { choice: 'document', survivability: 2, self_advocacy: 1 },
];

/** Play a single branch: pick the first choice `i`, then the lone continue. */
function playBranch(i: number) {
  const engine = new StoryEngine(ordeal1);
  engine.choose(i);
  // Each fallout has exactly one (zero-delta) continue to the result.
  expect(engine.currentChoices()).toHaveLength(1);
  engine.choose(0);
  return engine;
}

describe('Ordeal #1 scene', () => {
  it('every branch reaches the single terminal result passage', () => {
    EXPECTED.forEach((_, i) => {
      const engine = playBranch(i);
      expect(engine.isEnded()).toBe(true);
      expect(engine.currentText()).toBe(ordeal1.passages.find((p) => p.id === 'result')!.text);
    });
  });

  it('each choice yields its exact expected score pair (regression guard)', () => {
    EXPECTED.forEach((exp, i) => {
      const { survivability, self_advocacy } = playBranch(i).scores();
      expect({ survivability, self_advocacy }).toEqual({
        survivability: exp.survivability,
        self_advocacy: exp.self_advocacy,
      });
    });
  });

  it('is calibrated: no choice maxes both axes, and the axis leaders differ', () => {
    const pairs = EXPECTED.map((_, i) => playBranch(i).scores());
    const maxSurv = Math.max(...pairs.map((p) => p.survivability));
    const maxSelf = Math.max(...pairs.map((p) => p.self_advocacy));

    // (a) No single choice is maximal on BOTH axes.
    expect(pairs.some((p) => p.survivability === maxSurv && p.self_advocacy === maxSelf)).toBe(false);

    // (b) The survivability leader and self-advocacy leader are different, unique choices.
    const survLeaders = pairs.flatMap((p, i) => (p.survivability === maxSurv ? [i] : []));
    const selfLeaders = pairs.flatMap((p, i) => (p.self_advocacy === maxSelf ? [i] : []));
    expect(survLeaders).toHaveLength(1);
    expect(selfLeaders).toHaveLength(1);
    expect(survLeaders[0]).not.toBe(selfLeaders[0]);
  });

  it('setup offers exactly four labeled choices', () => {
    expect(new StoryEngine(ordeal1).currentChoices()).toHaveLength(4);
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

    // Drive a complete branch and exercise both client stores.
    const engine = new StoryEngine(ordeal1);
    engine.choose(2);
    engine.choose(0);
    expect(engine.isEnded()).toBe(true);
    new JournalStore('reflection').flush('note');
    const meter = new PullMeter('pull');
    meter.recordPlay();
    meter.recordCtaClick();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
