import type { Scene } from './types';
import { ordeal1 } from './ordeal1';
import { ordeal2 } from './ordeal2';
import { ordeal3 } from './ordeal3';

/** One playable crisis in the sequence. `id` namespaces its client-side storage
 *  (`<id>-reflection`, `<id>-pull`) so each ordeal is scored/recorded independently. */
export interface Ordeal {
  id: string;
  /** Short title shown on the "Next ordeal →" hand-off button. */
  title: string;
  scene: Scene;
}

/** The ordered run. Append future ordeals here; the engine, UI, and the
 *  per-ordeal stores are all driven off this list, so adding #3 is one entry. */
export const ordeals: Ordeal[] = [
  { id: 'ordeal1', title: 'The wrong number', scene: ordeal1 },
  { id: 'ordeal2', title: 'The dashboard nobody used', scene: ordeal2 },
  { id: 'ordeal3', title: 'The clean no', scene: ordeal3 },
];

/** One-line teaser shown after the last authored ordeal (no next to hand off to). */
export const nextTeaser = 'More ordeals are still being written.';
