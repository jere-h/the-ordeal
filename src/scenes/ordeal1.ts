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
          label: 'Post it in the channel now — error in writing, cc your manager.',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'esc_fight',
        },
        {
          label: 'Head down. Take the blame quietly at Monday standup.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'esc_absorb',
        },
        {
          label: 'Call your manager tonight; let them quarterback the exec comms.',
          deltas: { survivability: 2, self_advocacy: 2 },
          to: 'esc_channel',
        },
        {
          label: 'Quietly fix the query, write a changelog, mention it in your 1:1.',
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
        { kind: 'message', from: 'You', via: 'slack', time: '7:02pm', text: 'Heads up — revenue on the dashboard is overstated ~12%. Refund de-dup bug. Correcting now.', self: true },
        { kind: 'message', from: 'Manager', via: 'call', time: '7:13pm', text: "Why is a 12% error in writing org-wide before I've seen it? The CFO's chief of staff already called me." },
        { kind: 'message', from: 'Manager', via: 'call', time: '7:14pm', text: "Let me get ahead of it. The chief of staff offered to own the Monday correction — that gets it off you. Let me make calls." },
      ],
      choices: [
        {
          label: 'Hold the line: corrected number stays in writing, your name on the catch.',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'fallout_fight_hold',
        },
        {
          label: 'Stand down. Apologize for the timing; let the chief of staff own it.',
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
          label: 'Let it ride. Nod, eat it whole, keep the room calm.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_absorb_eat',
        },
        {
          label: 'After standup, walk your manager through the join — factual, on record.',
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
          label: 'Defer. Let them frame it; trust them to credit you when it counts.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_channel_defer',
        },
        {
          label: 'Ask the catch go on record under your name — framing stays theirs.',
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
        { kind: 'narration', text: 'Monday the board gets the truth in full, traceable to you.' },
        { kind: 'message', from: 'Manager', via: 'dm', text: "CFO wasn't mad about the number — about reading it cold in an open channel before anyone could frame it." },
        { kind: 'narration', text: 'Tuesday standup, two people glance at you before they speak. The number was right. You are still the one holding it.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_fight_fold',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'narration', text: 'You apologize for the timing. Your manager exhales — you hear the whole weight leave the call.' },
        { kind: 'narration', text: 'Monday the CFO restates it, clean and senior; the catch reads as the org\'s. Nobody is mad anymore, and that feels good.' },
        { kind: 'narration', text: 'Then you scroll the thread where your name has quietly stopped appearing — the part that was yours, now smoothly not.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb_eat',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'narration', text: 'You let it stand. The senior analyst gives you a small grateful nod.' },
        { kind: 'message', from: 'Manager', via: 'dm', text: 'CFO heard it was a new-hire dashboard slip, already handled. Nothing structural. He\'s satisfied.' },
        { kind: 'narration', text: 'No enemies, nobody mad. But "the new person\'s dashboard was off" got said out loud, half of it never yours — and you can still hear it.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb_reclaim',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'You', via: 'dm', text: 'Quick note on the dashboard: dup-prone rows came from the upstream pipeline; the missing de-dup was mine. Wanted both on record.', self: true },
        { kind: 'narration', text: 'Your manager gets it — who owns which half — and fields the CFO\'s "how did 12% clear two layers" naming both.' },
        { kind: 'narration', text: 'For days you brace for an angry email from the senior analyst that never comes. You didn\'t feel brave. But the record is true.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_channel_defer',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: 'Handled. Framed it as "a refinement we caught." No team named, no drama. You\'re covered.' },
        { kind: 'narration', text: 'The catch becomes the org\'s. The week is calm; you\'re protected, well-liked.' },
        { kind: 'narration', text: 'That night you open a blank note to write down what really happened — and close it without typing. You did catch it. Only two of you know.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_channel_record',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Manager', via: 'dm', text: 'Fine — one line of credit to you. Team stays unnamed though.' },
        { kind: 'narration', text: 'A beat before he agreed, just long enough to feel. You spent a little of his patience asking.' },
        { kind: 'narration', text: 'Monday the catch ships with a name on it: yours. One line nobody rereads. You reopen the deck Tuesday and it\'s still there — lighter than you\'d have guessed.' },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },

    {
      id: 'result',
      blocks: [
        { kind: 'narration', text: 'The numbers were the easy bit. The room was the real puzzle.' },
        { kind: 'narration', text: 'Your first move set your stance; the second, under new pressure, revealed you.' },
        { kind: 'narration', text: 'There was no single answer that won everything at once.' },
      ],
    },
  ],
};
