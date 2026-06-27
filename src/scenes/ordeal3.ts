import type { Scene } from './types';

// Ordeal #3 — "The Clean No."
//
// The positive MIRROR of #1 and #2. A PM you genuinely like — Priya, who's good
// to you, who has a real reason — asks for the activation number sliced a way you
// know will mislead. Not malicious. Convenient for her narrative. The whole scene
// is the first time you hold a line on the integrity of a number and find out it
// can go WELL: held right, it earns respect instead of costing it. The catch is
// that it has to cost something first — the no lands on someone sympathetic, and
// even the cleanest hold cools the room half a degree before it warms.
//
// Axes, mapped for the upside:
//   Self-Advocacy  = holding your line / protecting your judgment and the integrity
//                    of the number (the high-self-adv path is the clean firm "no,
//                    here's the honest version").
//   Survivability  = staying easy and liked / giving the convenient cut / not
//                    making it a thing (the high-surv path gives Priya what flatters
//                    her deck and stays out of it).
//
// A two-decision arc (matching #1 and #2). The first choice picks your STANCE on
// the ask; an escalation beat arrives with NEW pressure — Priya isn't a villain,
// she pushes back with a real reason and real stakes (her review is Thursday) —
// and the second choice is the follow-through. Scores accumulate (~0..6 per axis).
//
// Calibration over FULL root→terminal paths (enforced by story.test.ts): no path
// maxes BOTH axes, and the Self-Advocacy leader (HOLD → firm, 6) and the
// Survivability leader (GIVE → clean, 6) are DIFFERENT, UNIQUE paths. Every fallout
// leaves a path of constructive agency; even the convenient cut carries a faint
// private cost, and even the clean hold cooled the room a beat before it paid off.
//
// HOLD funnels to esc_push; HONEST funnels to esc_question; CAVEAT and GIVE share
// esc_grateful — their fixed second-decision deltas combine with each stance's
// setup deltas, so the two shared fallouts read truthfully for either stance while
// the totals stay distinct (the same pattern as ordeal2's esc_let).
//
// Per-path totals (survivability, self_advocacy):
//   HOLD    → firm    (0,6)   [Self-Advocacy leader, unique max]
//   HOLD    → bend    (3,4)
//   HONEST  → stand   (2,5)
//   HONEST  → soften  (4,3)
//   CAVEAT  → onrec   (4,3)
//   CAVEAT  → verbal  (5,1)
//   GIVE    → onrec   (5,2)
//   GIVE    → verbal  (6,0)   [Survivability leader, unique max]

export const ordeal3: Scene = {
  start: 'setup',
  axes: ['survivability', 'self_advocacy'],
  passages: [
    {
      id: 'setup',
      beat: { n: 1, of: 3, label: 'The ask' },
      blocks: [
        { kind: 'narration', text: "Tuesday, mid-morning. You like working with Priya. She actually reads your charts, she fights for the team, and last month she talked you up to her director by name. Her DM lights up and you're already a little glad to see it." },
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: '10:42am', text: 'morning! the activation deck for QBR is due thurs and the new onboarding flow is the hero story 🎉 can you pull activation rate for it? want to show the jump' },
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: '10:43am', text: "oh — exclude the SMB signups from the cut? they onboard totally differently, it's noise. just the mid-market + enterprise, that's who the flow was really for" },
        { kind: 'narration', text: "You already know the shape of it, because you pulled it last week. SMB isn't noise. SMB is most of the volume, and they're the ones the new flow actually stalled." },
        {
          kind: 'data',
          label: 'activation_rate · new onboarding flow',
          lines: [
            "mid-market + enterprise only ...... 71%  (+9pts)   ← Priya's cut",
            'SMB only .......................... 38%  (−4pts)',
            'all segments (honest) ............. 52%  (+1pt)',
            'SMB = 64% of signups',
          ],
        },
        { kind: 'narration', text: "Her cut isn't a lie. It's true about a slice she's chosen because it's the slice that's up. The 71% is the QBR headline she needs; the 52% is the number. She asked nicely, she's right that the segments differ, and her review is riding on Thursday." },
      ],
      choices: [
        {
          label: 'Tell her straight: "I can\'t send 71% as the flow\'s number — that\'s SMB-excluded. Here\'s the honest cut."',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'esc_push',
        },
        {
          label: "Don't wait to be asked the wrong question — reply with the all-segments 52% and a one-line read of why SMB matters.",
          deltas: { survivability: 1, self_advocacy: 2 },
          to: 'esc_question',
        },
        {
          label: 'Pull her 71% cut, but caveat it hard in writing: "mid-market+ent only; all-in is 52%."',
          deltas: { survivability: 2, self_advocacy: 1 },
          to: 'esc_grateful',
        },
        {
          label: "Pull exactly what she asked. She knows her deck; it's her call, not yours.",
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'esc_grateful',
        },
      ],
    },

    // ── Escalation after HOLD: she's not offended, she's reasonable, and she makes
    //    the case better than you expected — which is exactly what makes it hard. ──
    {
      id: 'esc_push',
      beat: { n: 2, of: 3, label: 'The push' },
      blocks: [
        { kind: 'message', from: 'You', via: 'dm', time: '10:51am', text: "I can't put 71% as the flow's activation rate — that's with SMB excluded. The all-segments number is 52%. Happy to send that one with the segment split so the lift is still clear.", self: true },
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: '10:55am', text: "I hear you, genuinely. But SMB self-serves, they were never the target — putting them in *understates* what the flow did for the segment we built it for. I'm not hiding anything, I'll have the split in the appendix. I just need the headline to be the win it actually was. Thursday's kind of a big deal for me 😅" },
        { kind: 'narration', text: "It's a good argument, said by someone who's been good to you, with something real on the line. Holding now isn't righteous — it's you making her Thursday harder. The cursor blinks." },
      ],
      choices: [
        {
          label: 'Hold it warmly but cleanly: "then let\'s headline 71% for the segment, labeled as that — not as the flow\'s rate."',
          deltas: { survivability: 0, self_advocacy: 3 },
          to: 'fallout_hold_firm',
        },
        {
          label: 'Meet her halfway: lead with 71% if the 52% sits right under it, same slide, same size.',
          deltas: { survivability: 3, self_advocacy: 1 },
          to: 'fallout_hold_bend',
        },
      ],
    },

    // ── Escalation after HONEST: you gave the number she didn't ask for, and now
    //    she has to decide whether to use it — in front of you. ──
    {
      id: 'esc_question',
      beat: { n: 2, of: 3, label: 'The reply' },
      blocks: [
        { kind: 'message', from: 'You', via: 'dm', time: '10:49am', text: "Pulled it — flow's at 52% all-in (+1pt), but that hides the real story: mid-market+ent jumped to 71%, SMB dropped to 38%. The flow worked for who it was for and stalled SMB. That split is the actual insight imo.", self: true },
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: '10:54am', text: "...huh. ok the SMB drop is not what I wanted to find two days before QBR lol. but you're right that's the story. my director's going to ask why SMB fell and I won't have an answer. can you stand behind the split if it comes up live?" },
        { kind: 'narration', text: "You didn't just decline a bad cut — you handed her a harder, truer slide and your own name under it. Now she's asking if you'll be in the room when it gets questioned." },
      ],
      choices: [
        {
          label: 'Stand behind it: "yes — and I\'ll draft the SMB-drop read so you\'re not caught flat."',
          deltas: { survivability: 1, self_advocacy: 3 },
          to: 'fallout_honest_stand',
        },
        {
          label: 'Soften: "it\'s your deck — use the split however lands best, I just didn\'t want you blindsided."',
          deltas: { survivability: 3, self_advocacy: 1 },
          to: 'fallout_honest_soften',
        },
      ],
    },

    // ── Escalation after CAVEAT/GIVE: she's warmly grateful for the easy yes — and
    //    that gratitude is the thing your caveat now has to interrupt, or not. ──
    {
      id: 'esc_grateful',
      beat: { n: 2, of: 3, label: 'The thanks' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: '11:08am', text: "you're a lifesaver, seriously. dropping it into the hero slide now. you make this so much easier than the last analyst who'd turn every pull into a debate 🙏" },
        { kind: 'narration', text: "There it is — the reward for the easy yes, and the quiet line under it: the person who pushes back is 'a debate.' The 71% is already going into the deck as the flow's number. You can still leave a mark on the record, or let it be clean." },
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: '11:09am', text: 'QBR\'s exec-level btw, goes to the whole leadership staff. ok I owe you coffee ☕' },
      ],
      choices: [
        {
          label: 'Put the caveat on record: "glad to help — dropping a note that this is mid-market+ent; all-in is 52% so it\'s there if asked."',
          deltas: { survivability: 2, self_advocacy: 2 },
          to: 'fallout_grateful_onrec',
        },
        {
          label: 'Caveat it once, lightly, then let it go: "np — just so you know it\'s the segment cut, not all-in." 👍',
          deltas: { survivability: 3, self_advocacy: 0 },
          to: 'fallout_grateful_verbal',
        },
      ],
    },

    // ── Fallouts ──
    {
      id: 'fallout_hold_firm',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', text: "ok. labeled as the segment number. it's a weaker headline but I can't argue it's not the honest one. give me a sec to redo the slide." },
        { kind: 'narration', text: "A pause on the thread, longer than her usual. For an afternoon you're not sure if you just spent something with the one PM who had your back." },
        { kind: 'message', from: 'Priya (PM)', via: 'dm', time: 'Thu, 4:51pm', text: "director asked the SMB question in QBR. I had the real answer because of you. she said 'good, someone's actually watching the number.' that was about you. coffee's on me, I mean it." },
        { kind: 'narration', text: "It cost you a cool afternoon to find out: the first time you held a number and it landed, it didn't make you difficult. It made you the one they believe. You read her message twice." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_hold_bend',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', text: 'deal — 71% headline, 52% right under it same size. that I can defend. thank you for not just rolling over but also not making me bleed for it.' },
        { kind: 'narration', text: "Both numbers ship, same slide, neither hiding. Nobody's mad, and the truth is on the page if anyone reads to the second line." },
        { kind: 'narration', text: "It's a good outcome and you know it. You also know the eye goes to the big number first, and the big number is still hers. You held most of the line. Most." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_honest_stand',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', text: "sending the split with your SMB read attached. if my director pushes I'm pointing at you in the room — hope that's ok, in the good way." },
        { kind: 'narration', text: "Thursday she does point at you, in the good way. The director nods at the SMB slide longer than at the win slide. The harder truth turned out to be the more interesting one." },
        { kind: 'narration', text: "Walking out, another PM you don't know clocks that the analyst stood behind a number that wasn't flattering. You gained a little weight in the room. It came with eyes on you now, which is not the same as comfortable." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    {
      id: 'fallout_honest_soften',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', text: "thank you — honestly relieved you flagged the SMB thing privately and not in front of everyone. I'll use the split, framed gently. you saved me a bad surprise." },
        { kind: 'narration', text: "You gave her the true number and the grace to frame it. She takes both. The slide is honest enough; nobody's blindsided; she's warm to you for weeks." },
        { kind: 'narration', text: "You did the right thing and let her hold the wheel. The insight ships with her name steering it — which is fine, which is generous, which you'll quietly remember was yours first." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    // Shared by CAVEAT→onrec (4,3) and GIVE→onrec (5,2): the prose reads truthfully
    // for either stance — it never names which one you took.
    {
      id: 'fallout_grateful_onrec',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', text: "noted in the deck notes, appendix has the 52%. you're covered and so am I. appreciate you flagging it instead of just letting me run." },
        { kind: 'narration', text: "The convenient number leads the slide; your caveat rides in the notes where it's true but quiet. If anyone asks, it's there. You made sure it's there." },
        { kind: 'narration', text: "QBR comes and goes and nobody opens the appendix. The headline did its job. You stayed easy to work with and you left a fingerprint on the record — small, real, mostly for you. You'd know where to point if it ever mattered." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },
    // Shared by CAVEAT→verbal (5,1) and GIVE→verbal (6,0) [Survivability leader].
    {
      id: 'fallout_grateful_verbal',
      beat: { n: 3, of: 3, label: 'The fallout' },
      blocks: [
        { kind: 'message', from: 'Priya (PM)', via: 'dm', text: "you're the best. dropping it in now. seriously, so easy to work with — telling my director that too 🙌" },
        { kind: 'narration', text: "The 71% goes up as the flow's number. She's grateful, she's loud about it, and that warmth is real and it's yours. The QBR lands; the hero story is a hit; nobody asks about SMB because the slide gave them no reason to." },
        { kind: 'narration', text: "You're liked, you're trusted, you're the easy one. Weeks later you're pulling another cut and you catch yourself reaching for the flattering slice first, without being asked. You notice that. You file it. The 52% never came up — only you and the number know it was the truer one." },
      ],
      choices: [{ label: 'See where that leaves you', deltas: { survivability: 0, self_advocacy: 0 }, to: 'result' }],
    },

    {
      id: 'result',
      blocks: [
        { kind: 'narration', text: 'The number was never the hard part. The hard part was a likable person, a real reason, and a slice of the truth that happened to flatter them.' },
        { kind: 'narration', text: 'Your first move set your stance on the ask; the second, once she pushed back with everything good about her on the line, revealed you.' },
        { kind: 'narration', text: "And the thing nobody tells you at the start: holding a line can cost you the room for an afternoon and earn it back deeper. Not every time. But the first time it does, you don't forget it." },
      ],
    },
  ],
};
