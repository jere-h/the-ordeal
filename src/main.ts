import './styles.css';
import { mountDebugPanel } from './debug';
import { ordeal1 } from './scenes/ordeal1';
import { StoryEngine } from './story';
import { UIRenderer } from './ui';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app mount point');

const engine = new StoryEngine(ordeal1);
new UIRenderer(root, engine).render();

// No-op unless the URL carries `?debug` (facilitator readout, M5).
mountDebugPanel();
