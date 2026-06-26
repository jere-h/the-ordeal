// The scene-graph contract shared by the author (ordeal1.ts) and the StoryEngine.
//
// Deliberately tiny and declarative so a single hand-authored scene needs no
// compiler, and so branch reachability + score calibration are plain assertions
// over data. The StoryEngine interface that consumes this is the seam at which
// Ink/inkjs can later be swapped in without touching any UI code (see TRD).

export type PassageId = string;

/** The two non-technical scoring axes, each accumulated on a 0..3-per-choice scale. */
export interface Deltas {
  survivability: number;
  self_advocacy: number;
}

export interface Choice {
  label: string;
  deltas: Deltas;
  to: PassageId;
}

export interface Passage {
  id: PassageId;
  text: string;
  /** A terminal passage omits `choices` — that is how the engine detects the end. */
  choices?: Choice[];
}

export interface Scene {
  start: PassageId;
  axes: ['survivability', 'self_advocacy'];
  passages: Passage[];
}
