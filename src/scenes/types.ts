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
  /** The punchy lead shown on the button (the gesture, ~3–6 words). */
  label: string;
  /** Optional second line of nuance/sub-text under the lead, so a choice stays
   *  scannable without losing the authored texture. */
  detail?: string;
  deltas: Deltas;
  to: PassageId;
}

/**
 * A passage's content is a list of typed blocks instead of one prose blob, so the
 * UI can render the crisis the way it is actually experienced — as messages, a
 * phone call, a query result — rather than a wall of paragraphs. The model stays
 * presentation-agnostic (no markup, no class names): how a `message` becomes a
 * chat bubble lives entirely in the renderer.
 */
export type Block =
  /** A short line of scene-setting / interior prose. */
  | { kind: 'narration'; text: string }
  /**
   * One message in the crisis: a phone call, a DM, a Slack post, a line in
   * standup. `via` lets the renderer pick the right treatment; `self: true`
   * marks something the player says/sends (rendered as their own bubble).
   */
  | { kind: 'message'; from: string; via: 'call' | 'dm' | 'slack' | 'post' | 'standup'; time?: string; text: string; self?: boolean }
  /** A monospace data/query-result chip (e.g. the refund fan-out). */
  | { kind: 'data'; label?: string; lines: string[] };

/** Position of a passage in the arc, for the beat-progress indicator. Terminal passages omit it. */
export interface Beat {
  n: number;
  of: number;
  label: string;
}

export interface Passage {
  id: PassageId;
  blocks: Block[];
  /** Drives the progress indicator; omitted on the terminal result passage. */
  beat?: Beat;
  /** Optional CSS-art motif key for the per-passage hero band (see styles.css
   *  `.scene-art--{key}`): 'data-reveal' | 'silence' | 'thread' | 'call' |
   *  'room' | 'pressure' | 'aftermath' | 'spotlight' | 'sunset'. Decorative. */
  art?: string;
  /** A terminal passage omits `choices` — that is how the engine detects the end. */
  choices?: Choice[];
}

export interface Scene {
  start: PassageId;
  axes: ['survivability', 'self_advocacy'];
  passages: Passage[];
  /** Up to a few short, charged beats from this scene, offered on the result
   *  screen as one-tap "which moment hit hardest?" chips (no forced typing). */
  moments?: string[];
}

/** Flatten a block to plain text — used for the accessibility/text fallback and tests. */
export function blockText(b: Block): string {
  switch (b.kind) {
    case 'narration':
      return b.text;
    case 'message':
      return `${b.from}: ${b.text}`;
    case 'data':
      return [b.label, ...b.lines].filter(Boolean).join('\n');
  }
}
