import './styles.css';
import { mountDebugPanel } from './debug';
import { ordeals } from './scenes';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';
import { MenuScreen } from './menu';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app mount point');

const MENU_ROUTE = '#/';
const playRoute = (id: string): string => `#/play/${id}`;

/** The landing page: pick any story to play. */
function showMenu(): void {
  new MenuScreen(root!, { onSelect: (i) => navigate(playRoute(ordeals[i].id)) }).show();
  root!.scrollTo?.({ top: 0 });
}

/** Play the ordeal at `index`; its result hands off to the next story or back to the menu. */
function play(index: number): void {
  const ordeal = ordeals[index];
  const next = ordeals[index + 1];
  const engine = new StoryEngine(ordeal.scene);
  new UIRenderer(root!, engine, {
    ordealId: ordeal.id,
    nextTitle: next?.title,
    onNext: next ? () => navigate(playRoute(next.id)) : undefined,
    onMenu: () => navigate(MENU_ROUTE),
  }).render();
  root!.scrollTo?.({ top: 0 });
}

/** Hash router: `#/play/<id>` plays that story; anything else is the landing page.
 *  Using the hash means a refresh keeps you where you are and the browser back
 *  button returns to the menu — instead of restarting a fixed linear sequence. */
function renderRoute(): void {
  const match = location.hash.match(/^#\/play\/(.+)$/);
  const index = match ? ordeals.findIndex((o) => o.id === match[1]) : -1;
  if (index >= 0) play(index);
  else showMenu();
}

/** Set the hash (re-rendering via the hashchange listener), or re-render in place
 *  if the hash is already what we want (so a no-op navigation still refreshes). */
function navigate(hash: string): void {
  if (location.hash === hash) renderRoute();
  else location.hash = hash;
}

window.addEventListener('hashchange', renderRoute);
renderRoute();

// No-op unless the URL carries `?debug` (facilitator readout, M5).
mountDebugPanel();
