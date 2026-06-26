import './styles.css';
import { mountDebugPanel } from './debug';
import { ordeals } from './scenes';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app mount point');

/** Play the ordeal at `index`; its result screen hands off to the next one. */
function play(index: number): void {
  const ordeal = ordeals[index];
  const next = ordeals[index + 1];
  const engine = new StoryEngine(ordeal.scene);
  const renderer = new UIRenderer(root!, engine, {
    ordealId: ordeal.id,
    nextTitle: next?.title,
    onNext: next ? () => play(index + 1) : undefined,
  });
  renderer.render();
  root!.scrollTo?.({ top: 0 });
}

play(0);

// No-op unless the URL carries `?debug` (facilitator readout, M5).
mountDebugPanel();
