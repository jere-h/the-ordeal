import type { Scene } from './types';

// Ordeal #1 — "the wrong analysis shipped to the C-suite."
//
// Score calibration (enforced by story.test.ts): no choice maxes both axes, and
// the Survivability leader (ABSORB) and the Self-Advocacy leader (FIGHT BACK) are
// different choices — so there is no dominant "optimal" play, only trade-offs.
// Tone guardrail (PRD): every fallout leaves a path of constructive agency; none
// reads as "this career is hopeless."

export const ordeal1: Scene = {
  start: 'setup',
  axes: ['survivability', 'self_advocacy'],
  passages: [
    {
      id: 'setup',
      text:
        "Six weeks into your first analyst job. It's 5:58 on a Friday when you spot it: " +
        'the revenue dashboard you built double-counts refunds — the same dashboard the ' +
        "CFO screenshotted into this morning's board deck. The board has already seen the " +
        'number. It is overstated by twelve percent. Slack is quiet. Monday is coming.\n\n' +
        'What do you do?',
      choices: [
        {
          label: 'Reply-all to the exec thread now — own it loudly and explain the fix.',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'fallout_fight',
        },
        {
          label: 'Keep your head down. In Monday standup, take the blame quietly and move on.',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_absorb',
        },
        {
          label: 'Call your manager tonight and let them quarterback the exec comms.',
          deltas: { survivability: 2, self_advocacy: 2 },
          to: 'fallout_escalate',
        },
        {
          label: 'Quietly fix the query, write a clean changelog, mention it in your 1:1.',
          deltas: { survivability: 2, self_advocacy: 1 },
          to: 'fallout_document',
        },
      ],
    },
    {
      id: 'fallout_fight',
      text:
        'The email is out by 7pm. Saturday the CFO replies: "Appreciate the fast flag. ' +
        'Let\'s talk process Monday." You spent the weekend exposed — some read it as ' +
        'integrity, some now double-check everything you ship. You protected your judgment ' +
        'in public, and it cost you a calm weekend and a little cover. Owning an error fast ' +
        "is a muscle. It's sore the first time.",
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_absorb',
      text:
        'Monday you say "my mistake, already fixing it," and the room nods and moves on. ' +
        'No drama, no enemies, your standing intact. But you also let the moment cast you as ' +
        "the one who eats errors — including the half of this one that was a messy pipeline " +
        "you didn't build. Smooth water. Worth making sure it doesn't quietly become a habit.",
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_escalate',
      text:
        'Your manager picks up, exhales, and says "good catch — I\'ll handle the thread, you ' +
        'write up what happened." Monday they correct the board number with you cited as the ' +
        'one who caught it. You\'re protected and on record. You traded a little autonomy for ' +
        'a lot of cover — and learned what a manager is actually for.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_document',
      text:
        'By Monday the dashboard is right and your changelog is airtight. In your 1:1 you ' +
        'mention it; your manager appreciates the rigor. No drama — but the board still saw ' +
        'the wrong number, and nobody upstream knows it moved. Tidy and low-risk. Maybe too ' +
        'quiet to get credit for the catch, or to set the record straight.',
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'result',
      text:
        'However it landed, you just lived the part of the job no SQL tutorial covers: the ' +
        'numbers were the easy bit. The room was the real puzzle — and there was no single ' +
        'answer that won everything at once.',
    },
  ],
};
