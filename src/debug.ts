import { el } from './dom';
import { JournalStore } from './journal';
import { PullMeter, type PullCounters } from './pull';

// Opt-in playtest instrumentation (M5). The app never phones home, so the pull
// signal lives in localStorage. Append `?debug` to the URL to surface a small
// readout a facilitator can glance at — or copy as JSON — at the end of a
// session. Inert (not mounted) during a normal play.

/** Pure, testable one-line summary of the behavioral pull signal. */
export function pullReadout(c: PullCounters): string {
  const pct = c.plays ? Math.round((c.cta_clicks / c.plays) * 100) : 0;
  return `plays ${c.plays} · CTA ${c.cta_clicks} · pull ${pct}%`;
}

export function isDebug(search: string = location.search): boolean {
  return new URLSearchParams(search).has('debug');
}

/** Mount the readout only when `?debug` is present. Returns the node (or null). */
export function mountDebugPanel(doc: Document = document): HTMLElement | null {
  if (!isDebug()) return null;
  const pull = new PullMeter('ordeal1-pull');
  const journal = new JournalStore('ordeal1-reflection');

  const panel = el('aside', 'debug');
  const body = el('div', 'debug-body');
  const render = () => {
    body.innerHTML = '';
    body.appendChild(el('div', 'debug-row', pullReadout(pull.counters())));
    const note = journal.read();
    body.appendChild(el('div', 'debug-row', note ? `note: ${note}` : 'note: —'));
  };

  panel.appendChild(el('strong', 'debug-title', 'playtest signal'));
  panel.appendChild(body);

  const copy = el('button', 'debug-btn', 'copy JSON') as HTMLButtonElement;
  copy.type = 'button';
  copy.addEventListener('click', () => {
    const blob = JSON.stringify({ ...pull.counters(), reflection: journal.read() });
    void navigator.clipboard?.writeText(blob);
    copy.textContent = 'copied';
    setTimeout(() => (copy.textContent = 'copy JSON'), 1200);
  });
  panel.appendChild(copy);

  render();
  // Same-tab writes (a play, a CTA click) don't fire `storage`, so poll lightly.
  window.setInterval(render, 1000);
  doc.body.appendChild(panel);
  return panel;
}
