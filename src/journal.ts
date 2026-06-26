/**
 * Client-only reflection store. Debounced autosave to localStorage; never hits
 * the network (asserted by the no-network test).
 */
export class JournalStore {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: string | null = null;

  constructor(private readonly key: string, private readonly debounceMs = 250) {}

  read(): string {
    try {
      return localStorage.getItem(this.key) ?? '';
    } catch {
      return '';
    }
  }

  /** Debounced write — coalesces rapid keystrokes into one localStorage set. */
  write(text: string): void {
    this.pending = text;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.debounceMs);
  }

  /**
   * Persist immediately. With no argument, writes the latest pending value —
   * call this on teardown (`pagehide`) so the tail of a note typed within the
   * debounce window isn't lost. A `text` argument forces that exact value.
   */
  flush(text?: string): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const value = text ?? this.pending;
    if (value === null) return; // nothing written yet
    this.pending = value;
    try {
      localStorage.setItem(this.key, value);
    } catch {
      /* storage unavailable (private mode / quota) — reflection is best-effort */
    }
  }
}
