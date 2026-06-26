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
      text:
        "Six weeks into your first analyst job. It's 5:58 on a Friday when you spot it: " +
        'your revenue dashboard sums net revenue off the senior analyst\'s refunds table, ' +
        'joined onto orders by order_id — and that table emits a separate row for every ' +
        'partial refund. Multi-refund orders get counted once per row. You re-run it. Same ' +
        'number. You check the row counts; his refunds table has more rows than there are ' +
        "orders, and your sum never de-duped them. It's both: his pipeline laid the trap, your " +
        "query walked straight into it. The CFO screenshotted this dashboard into this morning's " +
        'board deck. The board has already seen the number. It is overstated by twelve percent.\n\n' +
        'Slack is quiet. Maybe it rounds out somewhere. Maybe nobody re-opens the deck before ' +
        'Monday. Maybe you just fix the query tonight and never say "twelve percent" out loud.\n\n' +
        'What do you do?',
      choices: [
        {
          label: 'Post it now in the channel where the dashboard is circulating — flag the error in writing, cc your manager.',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'esc_fight',
        },
        {
          label: 'Keep your head down. In Monday standup, take the blame quietly and move on.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'esc_absorb',
        },
        {
          label: 'Call your manager tonight and let them quarterback the exec comms.',
          deltas: { survivability: 2, self_advocacy: 2 },
          to: 'esc_channel',
        },
        {
          label: 'Quietly fix the query, write a clean changelog, mention it in your 1:1.',
          deltas: { survivability: 2, self_advocacy: 1 },
          to: 'esc_channel',
        },
      ],
    },

    // ── Escalation beat after FIGHT: you put the error in writing before your
    //    manager could control the timing — and the rebuke routes THROUGH them. ──
    {
      id: 'esc_fight',
      text:
        'The post goes up at 7:02pm — the live number, in writing, in a channel a lot of people ' +
        'can see. At 7:13 your phone rings. Your manager, and they are not calm. "Okay. Okay. ' +
        'Why is a twelve-percent error sitting in writing where the whole org can read it before ' +
        "I've even seen it? The CFO's chief of staff already called me — the CFO clocked that " +
        'number on a board screenshot." A pause, you can hear them thinking. "Okay. Let me get ' +
        "ahead of this. The chief of staff floated taking the correction onto their plate for " +
        'Monday — I think we let them run with that, it gets it off you. Just let me make some ' +
        'calls before this gets any louder."',
      choices: [
        {
          label: 'Hold the line: keep the corrected number in writing, your name on the catch.',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'fallout_fight_hold',
        },
        {
          label: 'Stand down. Apologize for the timing; let the chief of staff own the board correction.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_fight_fold',
        },
      ],
    },

    // ── Escalation beat after ABSORB: someone is happy to let you carry all of it. ──
    {
      id: 'esc_absorb',
      text:
        'Monday standup. You open your mouth to say "my mistake" — and the senior analyst whose ' +
        'pipeline emitted those dup-prone refund rows gets there first: "Yeah, we caught a data-entry ' +
        "thing on the new person's dashboard. Already on it.” The room relaxes. He just made " +
        'half his bug entirely yours, in one clean sentence, and looked generous doing it.\n\n' +
        'Everyone is already moving on. You have about four seconds.',
      choices: [
        {
          label: 'Let it ride. Nod, eat it whole, keep the room calm and the peace intact.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_absorb_eat',
        },
        {
          label: 'After standup, walk your manager through the join — factual, no blame, on record.',
          deltas: { survivability: 1, self_advocacy: 3 },
          to: 'fallout_absorb_reclaim',
        },
      ],
    },

    // ── Escalation beat after ESCALATE/DOCUMENT: the proper channel has its own politics. ──
    {
      id: 'esc_channel',
      text:
        'You did it the right way — looped in your manager, kept a clean trail. Sunday they ' +
        'call back, grateful and a little wired. "Good catch — really. Look, a wrong number ' +
        'going to the board rolls up to me, so let me be the one who frames how it lands ' +
        "Monday. Cleaner if it comes from me. The CFO's going to restate the twelve regardless. " +
        'Just — don\'t go around me on this one, okay? Trust me, it\'s the right call." He talks ' +
        'about the framing, the restatement, keeping it clean. He does not, you notice, say ' +
        'anything about whose name the catch lands under.',
      choices: [
        {
          label: 'Defer. Let them frame it their way and trust them to credit you when it counts.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_channel_defer',
        },
        {
          label: 'Ask that the catch be on record under your name — even if the framing stays theirs.',
          deltas: { survivability: 1, self_advocacy: 2 },
          to: 'fallout_channel_record',
        },
      ],
    },

    // ── Fallouts ──
    {
      id: 'fallout_fight_hold',
      text:
        'You keep it in writing — corrected number, your name on the catch. Your manager goes ' +
        'quiet on the phone. Monday the board gets the truth, in full, traceable to you. After, ' +
        'your manager mentions the CFO was less annoyed about the number than about reading it ' +
        'cold in an open channel before anyone could frame it — and says it carefully, the way ' +
        'you say a thing someone above you said about someone below you. At Tuesday standup two ' +
        'people glance at you before they speak, a half-second check you did not used to get. ' +
        'Tuesday night you keep replaying the second ' +
        'you hit post, certain and a little reckless, and you cannot decide whether you are proud ' +
        'of it. The number was right. You are still the one holding it.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_fight_fold',
      text:
        'You apologize for the timing and let the correction become the chief of staff’s to ' +
        'deliver. Your manager exhales — you can hear it, the whole shoulders-down weight of it ' +
        'leaving the call. Monday the CFO restates the number to the board, clean and controlled ' +
        'and from someone senior, and the catch reads as the org’s, not yours. Nobody is upset ' +
        'with you anymore; that part feels genuinely good, warmer than you expected. It is only ' +
        'later, scrolling the thread where your name has quietly stopped appearing, that you feel ' +
        'the small cold spot of it — the part that was yours, now smoothly not.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb_eat',
      text:
        'You let it stand. The room moves on, the senior analyst catches your eye and gives you a ' +
        'small grateful nod, and you are, on paper, the calm new hire who owns his mistakes. Word ' +
        'comes down through your manager that the CFO heard it was a new-hire dashboard slip, ' +
        'already handled, nothing structural — and is satisfied. No enemies. Nobody mad. You go ' +
        'home Monday and the apartment is quiet and you should feel relieved, and mostly you do. ' +
        'It is just that the sentence "the new person’s dashboard was off" got said out loud, with ' +
        'witnesses, and you can still hear it, and half of it was never yours, and you said nothing.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb_reclaim',
      text:
        'You rewrite the message to your manager four times before you send it, cutting every word ' +
        'that sounds like blame, and your hands aren’t quite steady when you finally walk them ' +
        'through the join — no accusation, just the data. They get it: the dup-prone rows came out ' +
        'of the upstream pipeline, the missing de-dup was yours. Now they know who owns which half. ' +
        'Your manager takes it up the line, and word filters back that the CFO ended up asking how ' +
        'a twelve-percent number got through two layers — your manager fielded it, named both ' +
        'halves. For the next few days you brace for an email from the senior analyst that never ' +
        'comes, half-sure you’ve made an enemy six weeks in, checking your inbox more than you want ' +
        'to admit. You didn’t make a scene. You also didn’t feel brave doing it, your stomach tight ' +
        'the whole time. But the record is true, and tonight that is the thing you get to keep.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_channel_defer',
      text:
        'You let your manager frame it. Monday the CFO restates the twelve to the board — the number ' +
        'was always going to be said out loud — but it lands as "a refinement we caught," no team ' +
        'named, no one cited. The catch becomes the org’s. Your manager is solidly in your corner ' +
        'now and the cross-team peace holds; you’re protected, you’re well-liked, the week is calm. ' +
        'That night you open a blank note to write down what actually happened, for yourself, and ' +
        'sit there with the cursor blinking, not sure why your chest is tight when everything went ' +
        'fine. You close it without typing anything. You did, in fact, catch it. Only you and your ' +
        'manager will ever know that, and one of you already seems to have moved on.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_channel_record',
      text:
        'You push, gently: the framing can be theirs, but the catch goes on record under your name. ' +
        'Your manager pauses — a beat just long enough that you feel it — then agrees to a one-line ' +
        'credit. The team still goes unnamed, and you can tell you’ve spent a little of their ' +
        'patience asking. Monday the CFO restates the twelve to the board as planned, and this time ' +
        'there’s a name attached to who caught it: yours. It’s one line in a deck nobody will reread. ' +
        'It is also, when you reopen the deck mid-Tuesday between two unrelated tickets, still there ' +
        'with your name on it — and you notice how much lighter that small fact makes you feel than ' +
        'you’d have guessed.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },

    {
      id: 'result',
      text:
        'However it landed, you just lived the part of the job no SQL tutorial covers: the ' +
        'numbers were the easy bit. The room was the real puzzle — the first move set your ' +
        'stance, but the second, under new pressure, is the one that revealed you. And there ' +
        'was no single answer that won everything at once.',
    },
  ],
};
