import type { Scene } from './types';
import { ordeal1 } from './ordeal1';
import { ordeal2 } from './ordeal2';
import { ordeal3 } from './ordeal3';

/** One playable crisis in the sequence. `id` namespaces its client-side storage
 *  (`<id>-reflection`, `<id>-pull`) so each ordeal is scored/recorded independently. */
export interface Ordeal {
  id: string;
  /** Short title shown on the landing page and the "Next ordeal →" hand-off button. */
  title: string;
  /** One-line teaser shown under the title on the landing page / story picker. */
  blurb?: string;
  scene: Scene;
}

/** The ordered run. Append future ordeals here; the engine, UI, and the
 *  per-ordeal stores are all driven off this list, so adding #3 is one entry. */
// Run order is a deliberate arc (playtested): lead with the most universal,
// shareable hook (the dashboard nobody opened), then the gut-punch, and close on
// the positive mirror so players finish on a payoff rather than two bleak ones.
// `id`s stay stable (ordeal1/2/3) so per-ordeal stores and EXPECTED_TOTALS don't move.
export const ordeals: Ordeal[] = [
  {
    id: 'ordeal2',
    title: 'The dashboard nobody used',
    blurb: "You shipped it clean. Three people opened it. Now it's quietly slated to be killed.",
    scene: ordeal2,
  },
  {
    id: 'ordeal1',
    title: 'The wrong number',
    blurb: 'Friday, 5:58pm. The revenue you shipped to the board is overstated 12%. Whose mistake is it — and whose name lands on it?',
    scene: ordeal1,
  },
  {
    id: 'ordeal3',
    title: 'The clean no',
    blurb: 'A PM you like wants the flattering cut of the numbers. Saying no is the easy part. Saying it well isn’t.',
    scene: ordeal3,
  },
];

/** One-line teaser shown after the last authored ordeal (no next to hand off to). */
export const nextTeaser = 'More ordeals are still being written.';
