import { el } from './dom';
import type { Block } from './scenes/types';

// Renders the typed content Blocks of a passage as graphics rather than prose:
// narration as a short line, messages as call cards / chat bubbles, and a data
// block as a monospace query-result chip. Pure DOM, no network, no dependencies.

/** Tiny inline SVGs so each channel reads at a glance (no icon font, no images). */
const ICONS: Record<string, string> = {
  call: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.24 1z"/></svg>',
  dm: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z"/></svg>',
  slack: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3 8.6 9H5l-.5 2h3.7l-1 4H3.5L3 17h3.7l-1.2 5h2L8.7 17h4l-1.2 5h2l1.2-5H18l.5-2h-3.8l1-4H19l.5-2h-3.7l1.2-5h-2L13.3 9h-4l1.2-6z"/></svg>',
  post: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z"/></svg>',
  standup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zM6 21a6 6 0 0 1 12 0z"/></svg>',
};

const VIA_LABEL: Record<string, string> = {
  call: 'Call',
  dm: 'DM',
  slack: 'Slack',
  post: 'Posted',
  standup: 'Standup',
};

function icon(name: string): HTMLElement {
  const span = el('span', 'msg-icon');
  span.innerHTML = ICONS[name] ?? '';
  return span;
}

function renderMessage(b: Extract<Block, { kind: 'message' }>): HTMLElement {
  const wrap = el('div', `msg msg--${b.via}${b.self ? ' msg--self' : ''}`);
  const head = el('div', 'msg-head');
  head.appendChild(icon(b.via));
  head.appendChild(el('span', 'msg-from', b.from));
  // The colored rail + icon already encode the channel for chat; only spell it
  // out for call/standup, which read as events rather than another DM.
  if (b.via === 'call' || b.via === 'standup') {
    head.appendChild(el('span', 'msg-via', VIA_LABEL[b.via] ?? b.via));
  }
  if (b.time) head.appendChild(el('span', 'msg-time', b.time));
  wrap.appendChild(head);
  wrap.appendChild(el('p', 'msg-body', b.text));
  return wrap;
}

function renderData(b: Extract<Block, { kind: 'data' }>): HTMLElement {
  const chip = el('div', 'data-chip');
  if (b.label) chip.appendChild(el('div', 'data-label', b.label));
  const pre = el('pre', 'data-lines');
  pre.textContent = b.lines.join('\n');
  chip.appendChild(pre);
  return chip;
}

/** Append every block in `blocks` to `container`, in order. */
export function renderBlocks(container: HTMLElement, blocks: Block[]): void {
  for (const b of blocks) {
    switch (b.kind) {
      case 'narration':
        container.appendChild(el('p', 'narration', b.text));
        break;
      case 'message':
        container.appendChild(renderMessage(b));
        break;
      case 'data':
        container.appendChild(renderData(b));
        break;
    }
  }
}
