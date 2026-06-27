# The Ordeal: Three Career Crises — MVP

A 5-minute interactive scene that previews the *emotional and political* reality of
a data-analyst job — the part no SQL tutorial covers. This MVP ships **Ordeal #1**
("the wrong analysis shipped to the C-suite") to test one make-or-break question
before building the full game: _does an authored crisis scene feel authentic enough
that target students call it real and want more?_

See `docs/prd.md`, `docs/trd.md`, and `docs/review-notes.md` for the product/tech
specs and the pre-build review.

## Stack

TypeScript + Vite, vanilla DOM, zero backend. The scene is authored as a typed
**scene graph** (`src/scenes/ordeal1.ts`) driven by a thin `StoryEngine` — no Ink
compiler/native toolchain for a single scene (see review-notes). All state
(reflection text, pull counters) is client-side `localStorage`; nothing is
transmitted.

## Run it

```bash
cd apps/the-ordeal
npm install
npm run dev        # local dev server
npm test           # unit tests: branch reachability + score calibration + no-network
npm run build      # static production build -> dist/
npm run preview    # serve the built bundle locally
```

## Deploy

Static output in `dist/` hosts anywhere (Vercel config included; works on GitHub
Pages too — `base: './'` keeps asset paths relative). No env vars, no server.

## How it works

- `src/scenes/types.ts` — the scene-graph contract (passages, choices, 0–3 deltas).
- `src/scenes/ordeal1.ts` — the authored scene: one setup, 4 choices, 4 fallouts,
  one shared result. Calibrated so **no choice wins both axes**.
- `src/menu.ts` / `src/main.ts` — the landing page (story picker) and a tiny hash
  router. Loading the app shows the menu; `#/play/<id>` plays a story, so a refresh
  stays put and the back button returns to the picker instead of restarting a fixed
  sequence. Finishing a story hands off to the next one or back to the menu.
- `src/story.ts` — `StoryEngine`: the format-agnostic seam (swap in Ink later here).
- `src/ui.ts` / `src/result.ts` — render passages/choices, then the two-axis result
  + trade-off readout + reflection box + "Would you play Ordeal #2?" CTA.
- `src/journal.ts` / `src/pull.ts` — client-only reflection store and the anonymous
  pull-signal counters (`plays` vs `cta_clicks`).

## The two axes

- **Survivability** — kept you employed, trusted, out of the crossfire.
- **Self-Advocacy** — protected your credit, boundaries, and judgment.

They trade off on purpose: there is no single optimal choice, only a revealing one.

## Reading the playtest signal (go/no-go for Ordeals #2–3)

- **Authenticity (gating):** ≥5 of 5–8 target users call it authentic, not fake.
- **Pull (gating):** ≥40% of completers click the Ordeal-#2 CTA. Read the counters
  on the device — in the browser console: `localStorage.getItem('ordeal1-pull')`.
- **Reflection (secondary):** most players can name a surprising moment or read the
  trade-off they made.

See `docs/prd.md` for the full success metrics and recruitment plan.
