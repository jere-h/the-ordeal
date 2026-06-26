/**
 * The behavioral pull signal (PRD success metric): two anonymous, client-only
 * counters — `plays` (incremented on reaching the result) and `cta_clicks`
 * (incremented when the "Would you play Ordeal #2?" CTA is clicked). No PII, no
 * network, no third-party analytics. The completion→CTA ratio is the go/no-go
 * input; during playtests it is read off the device (or via `ratio()` in a debug
 * console), not transmitted anywhere.
 */
export interface PullCounters {
  plays: number;
  cta_clicks: number;
}

export class PullMeter {
  constructor(private readonly key: string) {}

  private load(): PullCounters {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PullCounters>;
        return { plays: parsed.plays ?? 0, cta_clicks: parsed.cta_clicks ?? 0 };
      }
    } catch {
      /* fall through to zeros */
    }
    return { plays: 0, cta_clicks: 0 };
  }

  private save(c: PullCounters): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(c));
    } catch {
      /* best-effort */
    }
  }

  recordPlay(): void {
    const c = this.load();
    c.plays += 1;
    this.save(c);
  }

  recordCtaClick(): void {
    const c = this.load();
    c.cta_clicks += 1;
    this.save(c);
  }

  counters(): PullCounters {
    return this.load();
  }

  /** Completion→CTA ratio; 0 when there are no plays yet. */
  ratio(): number {
    const c = this.load();
    return c.plays ? c.cta_clicks / c.plays : 0;
  }
}
