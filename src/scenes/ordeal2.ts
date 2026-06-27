import type { Scene } from './types';

// Ordeal #2 — "The Dashboard Nobody Used."
//
// You shipped a clean dashboard six weeks ago. It works. It's just that almost
// nobody opens it — and in a shared quarterly planning doc you weren't cc'd on,
// you find it quietly slated for sunset. Shipping isn't adoption; the thing you
// built answered a question the team had already stopped asking by hand.
//
// A two-decision arc (matching #1). The first choice picks your STANCE on the
// silence; an escalation beat arrives with NEW information — the dashboard didn't
// just go unused, it missed the *real* need — and the second choice is the
// follow-through. Scores accumulate across both decisions (~0..6 per axis).
//
// Score calibration is over FULL root→terminal paths (enforced by story.test.ts):
// no path is maximal on BOTH axes, and the Self-Advocacy leader (PUSH → defend it,
// 6) and the Survivability leader (LET-GO → quiet, 6) are DIFFERENT, UNIQUE paths.
// Whether the silence is merit or politics stays unresolved on every path; every
// fallout leaves a path of constructive agency. There is no dominant play.
//
// REDIRECT and LET-GO funnel into one shared escalation state (esc_let): the
// manager's "want to own the exec report?" pivot. Their fallouts (reframe / quiet)
// carry fixed second-decision deltas; REDIRECT vs LET-GO differ only by their
// setup deltas (LET-GO is +1 survivability, -1 self-advocacy), so the arithmetic
// stays consistent across the shared funnel.
//
// Per-path totals (survivability, self_advocacy):
//   PUSH     → defend  (0,6)   [Self-Advocacy leader, unique max]
//   PUSH     → pivot   (3,4)
//   ASK      → defend  (2,5)
//   ASK      → pivot   (4,3)
//   REDIRECT → reframe (4,3)
//   REDIRECT → quiet   (5,1)
//   LET-GO   → reframe (5,2)
//   LET-GO   → quiet   (6,0)   [Survivability leader, unique max]

export const ordeal2: Scene = {
  start: 'setup',
  axes: ['survivability', 'self_advocacy'],
  passages: [
    {
      id: 'setup',
      art: 'silence',
      beat: { n: 1, of: 3, label: 'The silence' },
      blocks: [
        { kind: 'narration', text: "Six weeks ago you shipped the retention dashboard. It's clean, it's right. You check the usage panel." },
        {
          kind: 'data',
          label: 'retention_dashboard · usage (last 6 weeks)',
          lines: [
            'total views: 3',
            '  └ 2 of them: you',
            'unique viewers (excl. you): 1',
            'last viewed: 31 days ago',
          ],
        },
        { kind: 'message', from: 'PM', via: 'slack', text: "anyone have churn-by-cohort for Q3 planning? need it by EOD" },
        { kind: 'message', from: 'Senior analyst', via: 'slack', text: "pulling it by hand now, give me 20" },
        { kind: 'narration', text: "Your dashboard answers exactly that. Nobody links it. And then the line surfaces — you'd skimmed the shared Q3 planning doc days ago (you're not even on the thread), and only now does it land: \"Retention dash → sunset, low usage.\"" },
      ],
      choices: [
        {
          label: 'Link it in-channel',
          detail: "ask why it's being sunset before anyone tried it",
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'esc_press',
        },
        {
          label: 'DM the PM, low-key',
          detail: '"saw the sunset note — what did the dash miss for you?"',
          deltas: { survivability: 1, self_advocacy: 2 },
          to: 'esc_probe',
        },
        // hidden-trap: reads principled, costs credit
        {
          label: 'Take it to your manager first',
          detail: 'ask how to make it land, not who killed it',
          deltas: { survivability: 2, self_advocacy: 1 },
          to: 'esc_let',
        },
        {
          label: 'Let it go, move on',
          detail: 'it got built, it works; quietly archive it',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'esc_let',
        },
      ],
    },

    // ── Escalation after PUSH: you made it public, and the reply reframes the
    //    whole thing — the dashboard wasn't ignored, it answered the wrong cut. ──
    {
      id: 'esc_press',
      art: 'thread',
      beat: { n: 2, of: 3, label: 'The reply' },
      blocks: [
        { kind: 'message', from: 'You', via: 'slack', time: '2:41pm', text: "Churn-by-cohort is already in the retention dash — link here. Curious why it's slated to sunset before we've leaned on it?", self: true },
        { kind: 'message', from: 'Senior analyst', via: 'slack', time: '2:48pm', text: "It's by signup cohort. Planning needs it by *plan tier* — and tier lives in a different table and changes mid-quarter when someone upgrades, so churn-by-tier is a point-in-time join, not a slice the dash can do. I pull it by hand each time. Always have." },
        { kind: 'narration', text: "Read in front of the channel, it's true and it stings: you built the answer to a question they'd stopped asking. The thread waits on you." },
      ],
      choices: [
        {
          label: 'Defend the work',
          detail: '"tier\'s a nastier join, but I\'ll have a v1 tomorrow — don\'t sunset it yet"',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'fallout_press_defend',
        },
        {
          label: 'Concede the point openly',
          detail: '"you\'re right, wrong cut — let me rebuild it by tier with you"',
          deltas: { survivability: 3, self_advocacy: 1 },
          to: 'fallout_press_pivot',
        },
      ],
    },

    // ── Escalation after ASK: the DM gets you the real story, privately. ──
    {
      id: 'esc_probe',
      art: 'thread',
      beat: { n: 2, of: 3, label: 'The reply' },
      blocks: [
        { kind: 'message', from: 'You', via: 'dm', time: '2:50pm', text: "saw the sunset note on the retention dash — no drama, just want to learn. what did it miss for you?", self: true },
        { kind: 'message', from: 'PM', via: 'dm', time: '2:53pm', text: "honestly it's nice work. it's just by signup cohort and we plan by plan tier, so I never reach for it. nobody told you the slicing changed in April — that's on us, not you." },
        { kind: 'narration', text: "So it's not that you failed. It's that the question moved and the dashboard didn't, and no one routed the memo to the new hire. The fix is small. The credit is murkier." },
      ],
      choices: [
        {
          label: 'Put your name on the fix',
          detail: 'ask the PM to hold the sunset, note in the doc that you\'ll re-cut it',
          deltas: { survivability: 1, self_advocacy: 3 },
          to: 'fallout_probe_defend',
        },
        {
          label: 'Just fix the cut, quietly',
          detail: 'no fuss about the doc or who decided',
          deltas: { survivability: 3, self_advocacy: 1 },
          to: 'fallout_probe_pivot',
        },
      ],
    },

    // ── Escalation after REDIRECT/LET-GO: you went to your manager (or stayed
    //    quiet and they came to you). The pivot arrives as a hedged offer. ──
    {
      id: 'esc_let',
      art: 'call',
      beat: { n: 2, of: 3, label: 'The reply' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'call', time: 'Thu', text: "The dash thing — don't read too much into it. Usage is one signal; the cut just drifted to plan tier and nobody told you. Happens." },
        { kind: 'message', from: 'Manager', via: 'dm', time: 'Thu', text: "Look — there's an exec retention report going around by hand every cycle. The dash build was fine, honestly; it just didn't get used. Help me draft the next cut. Show me you've got why the last one didn't land, and it's a real shot." },
        { kind: 'narration', text: "It's an opening and a test in the same breath — not handed to you, dangled. The craft was never the problem; adoption was. Take it and it's on you to prove you know the difference." },
      ],
      choices: [
        {
          label: 'Claim the bigger thing',
          detail: '"I\'ll own the exec report — and fold the dash into it, by tier"',
          deltas: { survivability: 2, self_advocacy: 2 },
          to: 'fallout_let_reframe',
        },
        {
          label: 'Take it quietly',
          detail: "nod, take the report, don't raise the dashboard again",
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_let_quiet',
        },
      ],
    },

    // ── Fallouts ──
    {
      id: 'fallout_press_defend',
      art: 'aftermath',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'PM', via: 'slack', text: "ok — one day. send it by tier and we'll keep it." },
        { kind: 'narration', text: "You ship the tier cut next morning and the sunset line vanishes. The dash lives. Tuesday standup the senior analyst is a half-degree cooler, and your manager says nothing about how you raised it — which is its own kind of saying something: you're now the hire who litigates in-channel rather than quietly." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_press_pivot',
      art: 'aftermath',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Senior analyst', via: 'slack', text: "appreciate that. let's pair on the tier version — I'll send you how I cut it by hand." },
        { kind: 'narration', text: "Conceding fast in public reads as easy to work with, and you rebuild it together. The new dash is half theirs now, and so is the credit. It'll get used. You wonder, quietly, what holding the line one more beat would've kept." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_probe_defend',
      art: 'aftermath',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'PM', via: 'dm', text: "done — I edited the doc: 'on hold, re-cut by tier (you).' fair enough?" },
        { kind: 'narration', text: "You didn't make a scene; you made a record, your name on the fix in the doc that nearly buried the work. The PM stays warm; the senior who wrote the sunset line never mentions it. You can't tell if the silence was merit or just nobody's job to tell you. The dash is yours again." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_probe_pivot',
      art: 'sunset',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'narration', text: "You fix the cut over two evenings and reshare it, no fanfare. The PM thanks you; the sunset line quietly goes stale. Calm, clean, no friction with anyone." },
        { kind: 'narration', text: "But the doc still reads like the dash was a miss someone generously let you patch. You know the question moved, not your work. Only you know." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_let_reframe',
      art: 'spotlight',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: "Good — make it yours. I'll say in planning you're picking up the exec report." },
        { kind: 'narration', text: "You fold the dead dash into the bigger thing, by tier, and the sunset stops being a failure and becomes a footnote in something you own. It's a real swing now, and a real way to fall short. You don't get to keep the old work clean — you get to make the next one matter." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_let_quiet',
      art: 'sunset',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: "Good call not making it a thing. Fresh start on the report." },
        { kind: 'narration', text: "You archive it yourself. Final usage: four views, three of them you — the most loyal user it ever had, switching off its life support. You're trusted, easy, out of it. The first thing you ever shipped here got buried and you said nothing — and a small part of you files that away for next time." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },

    {
      id: 'result',
      blocks: [
        { kind: 'narration', text: "Three views. The thing you built worked perfectly and answered a question the team had quietly stopped asking." },
        { kind: 'narration', text: "Shipping it was the easy half; getting it used, and getting seen for it, was the half nobody graded you on in school." },
        { kind: 'narration', text: "Merit or politics — you finished without ever finding out which one buried it. Some weeks that's just the job." },
      ],
    },
  ],
  moments: [
    "'total views: 3'",
    'The sunset note you found by accident',
    'Switching off its life support',
  ],
};
