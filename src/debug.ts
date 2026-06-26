import { el } from './dom';
import { JournalStore } from './journal';
import { PullMeter, type PullCounters } from './pull';
import { ordeals } from './scenes';

// Opt-in playtest instrumentation (M5). The app never phones home, so the pull
// signal lives in localStorage. Append `?debug` to the URL to surface a small
// readout a facilitator can glance at — or copy as JSON — at the end of a
// session. Inert (not mounted) during a normal play.

/** Pure, testable one-line summary of the play count (the CTA pull signal was removed). */
export function pullReadout(c: PullCounters): string {
  return `plays ${c.plays}`;
}

export function isDebug(search: string = location.search): boolean {
  return new URLSearchParams(search).has('debug');
}

/** Mount the readout only when `?debug` is present. Returns the node (or null).
 *  Shows the play count + reflection for every ordeal in the run. */
export function mountDebugPanel(doc: Document = document): HTMLElement | null {
  if (!isDebug()) return null;
  const meters = ordeals.map((o) => ({
    title: o.title,
    pull: new PullMeter(`${o.id}-pull`),
    journal: new JournalStore(`${o.id}-reflection`),
  }));

  const panel = el('aside', 'debug');
  const body = el('div', 'debug-body');
  const render = () => {
    body.innerHTML = '';
    for (const m of meters) {
      body.appendChild(el('div', 'debug-row', `${m.title}: ${pullReadout(m.pull.counters())}`));
      const note = m.journal.read();
      if (note) body.appendChild(el('div', 'debug-row', `  note: ${note}`));
    }
  };

  panel.appendChild(el('strong', 'debug-title', 'playtest signal'));
  panel.appendChild(body);

  const copy = el('button', 'debug-btn', 'copy JSON') as HTMLButtonElement;
  copy.type = 'button';
  copy.addEventListener('click', () => {
    const blob = JSON.stringify(
      meters.map((m) => ({ ordeal: m.title, ...m.pull.counters(), reflection: m.journal.read() })),
    );
    void navigator.clipboard?.writeText(blob);
    copy.textContent = 'copied';
    setTimeout(() => (copy.textContent = 'copy JSON'), 1200);
  });
  panel.appendChild(copy);

  render();
  // Same-tab writes (a play) don't fire `storage`, so poll lightly.
  window.setInterval(render, 1000);
  doc.body.appendChild(panel);
  return panel;
}
