# Future Ordeals — idea bank & positive-ordeal design note

The first two ordeals are damage-control crises (a wrong number to the board; a
dashboard nobody used). This note captures the work to widen the emotional range
toward **positive** workplace situations — the affirming, energizing moments of a
junior data-analyst's life — *without* going saccharine. It's the source material
behind **Ordeal #3 — "The Clean No"** (`src/scenes/ordeal3.ts`) and the menu for
what to build next.

It was developed with two lenses: a target-audience **undergraduate** (a final-year
data/analytics major about to enter the workforce) who pressure-tested every idea
for authenticity, and a **narrative designer** who solved how positivity fits the
two-axis engine.

## The design problem (and the fix)

The engine scores every outcome on two axes that **trade off** — no path wins both:

- **Survivability** — kept you employed, trusted, out of the crossfire.
- **Self-Advocacy** — protected your credit, boundaries, and judgment.

The bleak ordeals express this through *damage* ("notice what it asked you to
swallow"). A naïve positive scene where nothing costs anything collapses the
trade-off and reads as a participation trophy.

**The fix: keep the engine; move the cost from damage-control to opportunity-cost.**
Good news isn't free. A real opening forces a choice between *reaching for the thing*
(claim it, put your name on it, raise your hand → **Self-Advocacy**) and *protecting
what you already have* (the trust, the ease, the senior who likes you →
**Survivability**). The good feeling and the tension coexist. The scene still does
the same job — *revelation, not victory* — just with the valence flipped.

### How positive ordeals should differ in craft

- **Open warm, then complicate.** Don't open on dread — open on a genuinely good
  beat (a win in the query result, real praise in a DM) and hold it for a block
  before the complication lands. Let the warmth register first.
- **The escalation introduces an honest claimant, not a villain.** Someone with a
  *legitimate* partial claim — a teammate who contributed, a senior whose turf this
  touches, a sympathetic stakeholder with a real reason. The pressure is "this good
  thing is also partly someone else's / costs someone something."
- **Keep the symmetry of small loss.** The high-Survivability ending should carry a
  faint private ache; the high-Self-Advocacy ending should win something real that
  also cooled the room a little.
- **Under-write the good feeling.** Render the win as a message or a data chip and
  trust it. Gushing ("a surge of pride and validation") reads YA instantly.

### Traps that ring false (avoid)

1. **The fake dilemma** — one choice is obviously correct; the trade-off is cosmetic.
2. **The validation hit** — pure wish-fulfillment, "you nailed it, everyone claps."
3. **The disguised crisis** — a damage scene in a party hat ("don't screw up the
   good thing" is still Ordeal #1).
4. **The villain import** — making the other claimant a thief so reaching is a
   no-brainer; it breaks the "no path wins both" honesty.
5. **Over-narrating.** The bleak scenes earn their weight by under-writing. Same
   discipline here.

Also flagged as inherently fake by the undergraduate: the praise email with no
decision in it; the promotion/raise scene (too soon for a 6-week hire; makes it
about ladder-climbing); the villain who apologizes; the "we're a family" lunch; and
**any scene where being honest/right has zero cost** — that breaks the contract.

### Axes: reuse them, don't invent

Positive ordeals **reuse Survivability and Self-Advocacy unchanged** — you reframe
the meaning of the *choices*, not the axes. A new axis or renamed pole would mean
touching `types.ts`, `result.ts`, the renderer, and the invariant suite, and would
desync the result screen between ordeals. Not worth it. (The `result` passage is
per-scene, so a positive ordeal can still give its closing readout a more
generative final line without touching any shared code — see Ordeal #3's result.)

## The idea bank (undergraduate)

Ranked roughly by the undergraduate's enthusiasm; ✅ = "I'd actually play this."

1. **The clean no** ✅ *(built — Ordeal #3)* — a likable PM (not a villain) asks for
   a number sliced to flatter their narrative. The first time you hold a line and it
   goes *well*. Positive mirror of the bleak ordeals.
2. **The number nobody asked for** ✅ — you spot a real pattern nobody asked you to
   look for. Chase it on unbudgeted time, or flag it and let a senior own the dig?
   Let one branch have it actually be noise. *(Designer's Concept C variant.)*
3. **The handoff** ✅ — a greener new hire shadows you and asks something you only
   learned last month. Give the fast answer, actually teach the why (eats your
   deadline), or gatekeep to stay valuable? Mentorship from the *junior* side.
4. **The ally across the aisle** ✅ — a curt engineer/PM suddenly DMs "this saved me,
   show me how?" Over-help and become their free analyst, stay transactional, or
   invest in a real ally?
5. **Two slides** ✅ — your manager forwards your analysis up and you, not them,
   present to leadership. A VP pushes back hard mid-presentation. Defend, concede &
   "take it offline," or admit the one real limitation and pivot to what you're sure
   of? Defending well must still cost a little.
6. **Right, and it mattered** ✅ — a decision is about to be made on a hunch; your
   data says the opposite, and the room is leaning the other way. The win only works
   if changing their mind requires giving them a way to save face. *(High fake-risk
   — the craft is social, not technical. Designer's Concept C cousin.)*
7. **Trusted with the keys** ✅ — your manager hands you something above your level
   because they trust you. Accept fully (underwater, no safety net) or ask for
   guardrails (safer, but signals you're not ready)? *(Designer's Concept A.)*
8. **The reorg opening** ✅ — your name is floated for a level-up role; a senior has
   a legitimate prior claim. How loudly do you raise your hand? *(Designer's
   recommended Concept A — cleanest axis fit; strong candidate for #4.)*
9. **The craft moment** ✅ — you find an elegant fix to someone's messy/buggy query
   and a senior sees the elegance. Flag the previous version (politically loaded) or
   fix it silently?
10. **The mentor's bandwidth** ✅ — an admired senior offers to mentor you onto their
    bigger project, but they're overcommitted and half-using you for capacity. Take
    it, negotiate scope, or pick a smaller but reliable opportunity?
11. **Shipped and they noticed** ✅ — weeks later you find a thread where people are
    using/citing your work without knowing you're reading. Out yourself, stay quiet,
    or DM one person to deepen it? *(Lower-stakes — better as a short coda.)*
12. **The recovery lap** ✅ — a callback to a past mistake (e.g. the wrong-number
    dashboard) where you get a quiet second chance to fix it on your terms. Make the
    fix visible (reopens wounds, gets credit) or fix it quietly (mature, invisible)?
    *Would benefit from remembering earlier choices — a continuity feature.*

## Recommended next builds

- **#4 — "The Reorg Opening"** (idea 8 / designer Concept A). The designer's pick:
  the cleanest mapping of the upside trade onto the two axes ("how loudly do you want
  this good thing"), universal, low authoring risk. A validated 8-path score table
  exists in the design note; it's drop-in ready.
- **#5 — "The Number They Don't Want"** (ideas 2/6 / designer Concept C). Your
  curiosity surfaces a bankable finding that lands on a senior's deprioritized
  roadmap. Also has a validated score table. Leans slightly toward the conflict
  register, so it lands harder *after* a cleaner positive ordeal establishes the
  shift.

Both have full beat sketches and calibration-checked `(survivability, self_advocacy)`
tables ready to author against the same topology Ordeal #3 uses.

## Authoring checklist (every ordeal)

Enforced by `src/story.test.ts` over every scene in the `ordeals` list:

- Exactly **4** labeled setup choices.
- A two-decision arc: **8** root→terminal paths, each `[first, second, continue]`;
  first choices funnel into a small number of shared escalation passages.
- Each per-decision delta is an integer **0..3** per axis; per-axis ceiling **6**.
- **No path maxes both axes;** the Survivability leader and Self-Advocacy leader are
  **different, unique** paths.
- One single shared terminal `result` passage.
- Add the scene's 8 totals to `EXPECTED_TOTALS` in `story.test.ts`.
- Tone guardrail: every fallout leaves a path of constructive agency — none reads as
  "this career is hopeless."
