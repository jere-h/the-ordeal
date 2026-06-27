import type { Scene } from './types';

// Ordeal #1 — "the wrong analysis shipped to the C-suite."
//
// A two-decision arc. The first choice picks your STANCE under the Friday-night
// shock; an escalation beat then arrives with NEW pressure (someone reacts to
// what you did, or a stakeholder forces your hand) and the second choice is the
// follow-through. Scores accumulate across both decisions (~0..6 per axis).
//
// Score calibration is over FULL root→terminal paths (enforced by story.test.ts):
// no path is maximal on BOTH axes, and the Survivability leader (ABSORB → eat it)
// and the Self-Advocacy leader (FIGHT → hold the line) are DIFFERENT paths — so
// there is no dominant "optimal" play, only trade-offs that compound.
// Tone guardrail (PRD): every fallout leaves a path of constructive agency; none
// reads as "this career is hopeless."
//
// First choices funnel into three escalation states (FIGHT, ABSORB, and a shared
// proper-channel state for ESCALATE/DOCUMENT), keeping the tree tractable while
// every path stays distinct via its accumulated deltas.
//
// Content is authored as scannable message/data/narration blocks (see types.ts) —
// the crisis is rendered as the texts and query results it actually arrives as.
//
// Per-path totals (survivability, self_advocacy):
//   FIGHT    → hold    (0,6)   [Self-Advocacy leader]
//   FIGHT    → fold    (3,3)
//   ABSORB   → eat     (6,0)   [Survivability leader]
//   ABSORB   → reclaim (4,3)
//   ESCALATE → defer   (5,2)
//   ESCALATE → record  (3,4)
//   DOCUMENT → defer   (5,1)
//   DOCUMENT → record  (3,3)

export const ordeal1: Scene = {
  start: 'setup',
  axes: ['survivability', 'self_advocacy'],
  passages: [
    {
      id: 'setup',
      beat: { n: 1, of: 3, label: 'The mistake' },
      blocks: [
        { kind: 'narration', text: "5:58pm Friday, six weeks in. You re-run the revenue dashboard. Same number. Then you see why." },
        {
          kind: 'data',
          label: 'revenue_dashboard · query result',
          lines: [
            'refunds JOINed on order_id',
            'multi-refund orders counted once per row',
            'your SUM never de-duped',
            '→ revenue +12% (overstated)',
          ],
        },
        { kind: 'narration', text: "His pipeline laid the trap; your query walked into it. The CFO already screenshotted it into this morning's board deck." },
      ],
      choices: [
        {
          label: 'Post it now, publicly',
          detail: 'error in writing, cc your manager',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'esc_fight',
        },
        {
          label: 'Head down, eat it Monday',
          detail: 'take the blame quietly at standup',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'esc_absorb',
        },
        // hidden-trap: reads principled, costs credit
        {
          label: 'Loop in your manager first',
          detail: 'let the person who owns it lead the exec comms',
          deltas: { survivability: 2, self_advocacy: 2 },
          to: 'esc_channel',
        },
        {
          label: 'Fix it, log it, raise it in your 1:1',
          detail: 'correct the query, leave a clean changelog',
          deltas: { survivability: 2, self_advocacy: 1 },
          to: 'esc_channel',
        },
      ],
    },

    // ── Escalation beat after FIGHT: you put the error in writing before your
    //    manager could control the timing — and the rebuke routes THROUGH them. ──
    {
      id: 'esc_fight',
      beat: { n: 2, of: 3, label: 'The escalation' },
      blocks: [
        { kind: 'message', from: 'You', via: 'slack', time: 'Fri 7:02pm', text: 'Heads up — revenue on the dashboard is overstated ~12%. Refund de-dup bug. Correcting now.', self: true },
        { kind: 'message', from: 'Manager', via: 'call', time: 'Mon 8:40am', text: "Walked in to that 12% sitting in the open channel all weekend. Why is it in writing org-wide before I've seen it? The CFO's chief of staff has already pinged me twice this morning." },
        { kind: 'message', from: 'Manager', via: 'call', time: 'Mon 8:42am', text: "Let me get ahead of it before standup. The chief of staff offered to own the correction — that gets it off you. Let me make calls." },
      ],
      choices: [
        {
          label: 'Hold the line',
          detail: 'corrected number stays in writing, your name on the catch',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'fallout_fight_hold',
        },
        {
          label: 'Stand down',
          detail: 'apologize for the timing, let the chief of staff own it',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_fight_fold',
        },
      ],
    },

    // ── Escalation beat after ABSORB: someone is happy to let you carry all of it. ──
    {
      id: 'esc_absorb',
      beat: { n: 2, of: 3, label: 'The escalation' },
      blocks: [
        { kind: 'narration', text: 'Monday standup. You open your mouth to say "my mistake" —' },
        { kind: 'message', from: 'Senior analyst', via: 'standup', text: "Yeah, caught a data-entry thing on the new person's dashboard. Already on it." },
        { kind: 'narration', text: 'In one sentence he made half his bug entirely yours, and looked generous doing it. The room moves on. You have about four seconds.' },
      ],
      choices: [
        {
          label: 'Let it ride',
          detail: 'nod, eat it whole, keep the room calm',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_absorb_eat',
        },
        {
          label: 'Walk your manager through the join',
          detail: 'after standup, factual, on record',
          deltas: { survivability: 1, self_advocacy: 3 },
          to: 'fallout_absorb_reclaim',
        },
      ],
    },

    // ── Escalation beat after ESCALATE/DOCUMENT: the proper channel has its own politics. ──
    {
      id: 'esc_channel',
      beat: { n: 2, of: 3, label: 'The escalation' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'call', time: 'Sun', text: "Good catch, really. A wrong number to the board rolls up to me, so let me frame how it lands Monday. Cleaner from me." },
        { kind: 'message', from: 'Manager', via: 'call', time: 'Sun', text: "The CFO restates the 12% regardless. Just — don't go around me on this one. Trust me." },
        { kind: 'narration', text: 'He covers the framing, the restatement, keeping it clean. He does not say whose name the catch lands under.' },
      ],
      choices: [
        {
          label: 'Let them frame it',
          detail: 'trust them to credit you when it counts',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_channel_defer',
        },
        {
          label: 'Ask for your name on the catch',
          detail: 'on record — the framing stays theirs',
          deltas: { survivability: 1, self_advocacy: 2 },
          to: 'fallout_channel_record',
        },
      ],
    },

    // ── Fallouts ──
    {
      id: 'fallout_fight_hold',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: "Board got the correction Monday, traceable to you. CFO wasn't mad about the number — about reading it cold in the open channel before anyone could frame it." },
        { kind: 'narration', text: 'Tuesday standup, two people glance at you before they speak. The number was right. You are still the one holding it.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_fight_fold',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'narration', text: 'You apologize for the timing; your manager exhales. Monday the chief of staff restates it, clean and senior, and the catch reads as the org\'s. Nobody is mad anymore.' },
        { kind: 'narration', text: 'Then you scroll the thread where your name has quietly stopped appearing — the part that was yours, now smoothly not.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb_eat',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'narration', text: 'You let it stand. The senior analyst gives you a small grateful nod; the CFO hears it was a handled new-hire slip and moves on. No enemies, nobody mad.' },
        { kind: 'narration', text: 'But "the new person\'s dashboard was off" got said out loud, half of it never yours — and you can still hear it.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb_reclaim',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'You', via: 'dm', text: 'Quick note on the dashboard: the dup-prone rows came from the upstream pipeline; the missing de-dup was mine. Wanted both halves on record.', self: true },
        { kind: 'narration', text: 'For days you brace for an angry email from the senior analyst that never comes. You didn\'t feel brave. But the record is true.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_channel_defer',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: 'Handled. Framed it as "a refinement we caught." No team named, no drama. You\'re covered.' },
        { kind: 'narration', text: 'The catch becomes the org\'s. That night you open a blank note to write down what really happened — and close it without typing. You did catch it. Only two of you know.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_channel_record',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: 'Fine — one line of credit to you. Team stays unnamed though.' },
        { kind: 'narration', text: 'A beat before he agreed, just long enough to feel; you spent a little of his patience asking. Monday the catch ships with a name on it: yours, one line nobody rereads. You reopen the deck Tuesday and it\'s still there — lighter than you\'d have guessed.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },

    {
      id: 'result',
      blocks: [
        { kind: 'narration', text: 'The de-dup bug took four seconds to spot. Who would be holding it by Monday took the whole weekend.' },
        { kind: 'narration', text: 'Every honest move here cost you cover; every safe move cost you the record. You picked which one you could live with.' },
        { kind: 'narration', text: 'Six weeks in, and the spreadsheet was never the part they should have warned you about.' },
      ],
    },
  ],
  moments: [
    "The Monday-morning call",
    "'the new person's dashboard'",
    'Your name, quietly gone',
  ],
};
