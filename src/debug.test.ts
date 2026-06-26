import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isDebug, mountDebugPanel, pullReadout } from './debug';
import { PullMeter } from './pull';

describe('playtest debug readout', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
  });
  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState({}, '', '/');
  });

  it('formats the pull signal, guarding divide-by-zero', () => {
    expect(pullReadout({ plays: 0, cta_clicks: 0 })).toBe('plays 0 · CTA 0 · pull 0%');
    expect(pullReadout({ plays: 4, cta_clicks: 2 })).toBe('plays 4 · CTA 2 · pull 50%');
    expect(pullReadout({ plays: 3, cta_clicks: 1 })).toBe('plays 3 · CTA 1 · pull 33%');
  });

  it('detects the ?debug flag from the query string', () => {
    expect(isDebug('?debug')).toBe(true);
    expect(isDebug('?foo=1&debug=1')).toBe(true);
    expect(isDebug('')).toBe(false);
    expect(isDebug('?other=1')).toBe(false);
  });

  it('does not mount the panel during a normal (no-?debug) load', () => {
    // jsdom default location has no query string.
    expect(mountDebugPanel()).toBeNull();
    expect(document.querySelector('.debug')).toBeNull();
  });

  it('mounts and shows the live signal when ?debug is present', () => {
    vi.useFakeTimers(); // keep the refresh interval from leaking past the test
    window.history.replaceState({}, '', '/?debug');
    const pull = new PullMeter('ordeal1-pull');
    pull.recordPlay();
    pull.recordCtaClick();

    const panel = mountDebugPanel();
    expect(panel).not.toBeNull();
    expect(document.querySelector('.debug')).not.toBeNull();
    expect(panel!.textContent).toContain('plays 1 · CTA 1 · pull 100%');
  });
});
