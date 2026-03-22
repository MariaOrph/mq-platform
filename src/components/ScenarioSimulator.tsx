'use client'

import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Choice {
  label: string
  points: number          // 0, 1, or 2
  consequence: string     // what happens next in the story
  coaching: string        // why this was / wasn't the best move
}

interface Round {
  situation: string
  choices: Choice[]
}

interface Scenario {
  id: string
  tag: string
  title: string
  intro: string
  rounds: Round[]
}

interface PlayerStats {
  totalXp: number
  currentLevel: string
  levelIndex: number
  nextLevel: string | null
  xpForNext: number | null
  xpProgress: number | null
  bestByScenario: Record<string, { score: number; stars: number; xp_earned: number; completed_at: string }>
  runCount: number
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: 'psych-safety',
    tag: 'Psychological Safety',
    title: 'The Quiet Room',
    intro: "It's your weekly team meeting. You've just presented a plan you're confident about. You ask for questions. Silence. Then you notice Jamie — usually your most vocal team member — staring at the table. You ask directly: \"Jamie, thoughts?\" Jamie says, \"No, looks good to me.\" Three days later, you hear from a colleague that Jamie raised serious concerns about the plan in a side conversation.",
    rounds: [
      {
        situation: "You've just heard that Jamie had concerns but didn't raise them with you. What do you do?",
        choices: [
          {
            label: "Message Jamie: \"I heard you had concerns about the plan. Why didn't you say anything in the meeting?\"",
            points: 1,
            consequence: "Jamie responds cautiously, saying they didn't want to derail the meeting. The conversation feels a little tense. You get some useful information but Jamie seems guarded.",
            coaching: "Direct, but the framing can feel accusatory. 'Why didn't you' puts Jamie on the back foot. You get the information but don't necessarily build the trust that would make Jamie more likely to speak up next time.",
          },
          {
            label: "Leave it — the plan is moving forward anyway. If Jamie had something important to say, they should have said it.",
            points: 0,
            consequence: "The plan proceeds. Two weeks later it hits exactly the problem Jamie foresaw. The team is frustrated. Jamie feels vindicated but disengaged.",
            coaching: "Avoidance here sends a clear signal: silence is the path of least resistance. You may have already created a climate where people self-censor, and walking away reinforces it. The leader's job is to create the conditions for honesty, not wait for it to arrive uninvited.",
          },
          {
            label: "Find a moment to speak with Jamie 1:1: \"I noticed you went quiet when I asked for thoughts. I'd genuinely like your honest view — I find it more useful to hear concerns before things go wrong than after.\"",
            points: 2,
            consequence: "Jamie opens up. There are two real issues with the plan that you hadn't considered. You adjust the approach. In the next meeting, Jamie speaks up unprompted.",
            coaching: "This is the highest-leverage move. You're not just solving the immediate problem — you're actively rebuilding psychological safety. Naming what you noticed, inviting honesty, and framing concerns as useful (not disloyal) changes what Jamie believes is safe to do.",
          },
        ],
      },
      {
        situation: "In your next team meeting you want to actively invite more honest input. What's your approach?",
        choices: [
          {
            label: "Ask at the end: \"Any concerns or questions?\" and wait.",
            points: 0,
            consequence: "Polite silence again. One person asks a minor clarifying question. The dynamic hasn't changed.",
            coaching: "A generic open question at the end of a meeting rarely surfaces real concerns — people have already decided it's not the moment to push back. It's not enough to create an opening; you have to make speaking up feel normal and safe.",
          },
          {
            label: "Before presenting, say: \"I want to test this idea rather than just present it. I'm going to deliberately leave gaps — tell me what's missing or what I've got wrong.\"",
            points: 2,
            consequence: "The energy in the room shifts. Two people flag risks you hadn't fully accounted for. One person disagrees with the core assumption and you have the best team discussion in months.",
            coaching: "Brilliant. You've changed the social contract of the meeting before it begins. By framing your own thinking as incomplete and explicitly inviting challenge, you've made it safe — even expected — to disagree. That's what psychological safety leadership looks like in practice.",
          },
          {
            label: "Go around the room and ask each person individually what they think.",
            points: 1,
            consequence: "You get some useful input. A few people are clearly uncomfortable being put on the spot. One person gives a vague answer to avoid conflict.",
            coaching: "Better than a blanket open question — you're making it harder to opt out. But forcing people to speak publicly without prep can actually increase anxiety for quieter team members. Consider giving people a moment to write down one thought first, or asking in a way that doesn't feel like a test.",
          },
        ],
      },
      {
        situation: "After the meeting, a team member sends you a message flagging a significant risk you hadn't considered. You're mid-task and a bit stressed. How do you respond?",
        choices: [
          {
            label: "Reply quickly: \"Thanks, noted\" and file it to deal with later.",
            points: 0,
            consequence: "The team member doesn't hear back for days. When they follow up in a meeting and you haven't acted on it, they feel dismissed. They're less likely to flag something next time.",
            coaching: "Even a well-intentioned 'noted' can read as 'I'm not really listening.' How a leader responds to the first few times someone speaks up determines whether they do it again. Speed and acknowledgement matter, even if you can't act immediately.",
          },
          {
            label: "Reply: \"Really useful — this is exactly what I need to know before we go further. Can we grab 15 minutes this week to dig into it?\"",
            points: 2,
            consequence: "The team member feels heard. You meet, uncover a material issue, and fix it early. In the following months, that person becomes one of your most reliable early-warning signals.",
            coaching: "Perfect response. You've done three things: acknowledged the value of what they shared, shown that raising risks leads to action (not dismissal), and invested in the relationship. This is how you build a culture where problems surface early rather than late.",
          },
          {
            label: "Reply in detail, explaining why you think their concern is overblown, with your reasoning.",
            points: 1,
            consequence: "You make some good points. But the team member feels they've had to argue their case rather than be heard. They're not sure whether to flag things in future if it just leads to being challenged.",
            coaching: "Engaging with the substance is good — that's better than dismissing it. But leading with your counter-argument signals that speaking up means a debate, not a conversation. Try acknowledging first, asking questions to understand fully, then sharing your view. The sequence matters.",
          },
        ],
      },
    ],
  },

  {
    id: 'accountability',
    tag: 'Accountability',
    title: 'Three Strikes',
    intro: "Marcus is a capable member of your team — smart, well-liked, and experienced. But over the past six weeks, he has missed three deadlines. Each time, there has been a plausible reason: a family issue, a system problem, an underestimate of complexity. You've been understanding. Now it's happening again and a key stakeholder has noticed.",
    rounds: [
      {
        situation: "The stakeholder has raised it with you directly and is losing confidence. What do you do first?",
        choices: [
          {
            label: "Reassure the stakeholder that you're on it, then speak to Marcus urgently about the pressure you're now under.",
            points: 1,
            consequence: "Marcus feels the heat and delivers this time. But the underlying pattern hasn't been addressed. The same thing happens again six weeks later.",
            coaching: "Managing upwards first is sensible — protecting the relationship with the stakeholder matters. But using that external pressure as the reason for the conversation with Marcus keeps you in reactive mode. The conversation you need to have is about the pattern, not just this instance.",
          },
          {
            label: "Have a direct conversation with Marcus: \"I need to talk with you about a pattern I've noticed. This is the fourth time a deadline has been missed, and I want to understand what's going on and what we need to change.\"",
            points: 2,
            consequence: "Marcus is initially a bit defensive but then opens up. There's a real issue with workload and prioritisation that you hadn't fully seen. You agree a plan. The stakeholder's confidence returns over the following weeks.",
            coaching: "This is the right move. You're naming the pattern rather than just the latest incident, which is important — one conversation about a single miss is easily rationalised away. Framing it as 'what do we need to change' keeps it constructive and shares ownership of the solution.",
          },
          {
            label: "Give Marcus one more chance before saying anything, to avoid damaging the relationship.",
            points: 0,
            consequence: "Marcus misses again. By now the stakeholder has escalated and you're fielding awkward questions about why this wasn't addressed earlier. Marcus is embarrassed and feels exposed.",
            coaching: "The relationship concern is understandable but misplaced. Delayed accountability conversations rarely preserve relationships — they usually damage them more, because the person eventually finds out how long you knew and said nothing. The kind thing is clarity and honesty, early.",
          },
        ],
      },
      {
        situation: "In your conversation with Marcus, he says: \"I've been really struggling with the amount on my plate. I didn't want to admit I was behind.\" How do you respond?",
        choices: [
          {
            label: "\"I hear you — let's look at your workload together and see what we can take off your plate.\"",
            points: 1,
            consequence: "Marcus is relieved. You reprioritise some work. But the issue of not flagging problems early hasn't been named. Two months later, a similar situation plays out — Marcus quietly struggles rather than raising his hand.",
            coaching: "Good that you're problem-solving, but you've only addressed half the issue. The workload may be real, but the more important habit to build is Marcus flagging pressure early rather than absorbing it silently until it becomes a missed deadline. That part needs to be named explicitly.",
          },
          {
            label: "\"I appreciate you telling me that. Two things matter here: one is fixing the workload, and the other is making sure this doesn't happen silently again. If you're under pressure, I need to know early — not after a deadline is missed. Can we agree on that?\"",
            points: 2,
            consequence: "Marcus nods. You build a simple check-in rhythm. Over the following month, Marcus flags a potential delay two weeks before it would have become a problem. You solve it together. The pattern breaks.",
            coaching: "This is the gold standard response. You've validated the underlying issue, addressed the immediate problem, and named the behaviour change that needs to happen going forward. Accountability conversations that end with a clear, specific behavioural agreement are far more effective than ones that just troubleshoot the symptom.",
          },
          {
            label: "\"I get it, but the impact of missed deadlines is real — I need to be able to rely on you. If this keeps happening, we'll need to have a more serious conversation.\"",
            points: 0,
            consequence: "Marcus feels threatened. He becomes anxious and starts over-promising to avoid another conversation like this. Two of his next deliverables are rushed and below standard. A new problem has replaced the old one.",
            coaching: "Naming consequences has a place, but leading with a veiled warning when someone has just been vulnerable shuts down trust quickly. Marcus now knows the stakes but doesn't know what to do differently. A consequence without a clear path forward creates anxiety, not accountability.",
          },
        ],
      },
      {
        situation: "You want to prevent this pattern repeating across the team. What do you put in place?",
        choices: [
          {
            label: "Introduce a weekly team stand-up where everyone reports progress against their key commitments.",
            points: 1,
            consequence: "Visibility improves. But some team members find it performative. A couple of people start giving updates that sound good but don't surface real risks. The format creates compliance, not honesty.",
            coaching: "Visibility structures help, but they only work if the culture supports honest reporting. If people fear how you'll react to 'I'm behind', stand-ups become a performance rather than a genuine check-in. The format is only as good as the psychological safety around it.",
          },
          {
            label: "Have individual 1:1s with each team member to check in on workload and flag any early risks — and explicitly tell the team that raising pressure early is valued, not penalised.",
            points: 2,
            consequence: "Over the following months, team members start flagging issues earlier. One person raises a risk three weeks before it would have become a problem. The team starts to feel like a safe place to admit difficulty.",
            coaching: "This is the right system. You're pairing structure (regular 1:1s) with culture (explicitly naming that early flag-raising is valued). Accountability cultures don't just require processes — they require a clear signal from the leader about what's rewarded. You've sent that signal.",
          },
          {
            label: "Make it clear in the next team meeting that you expect deadlines to be met and that this is non-negotiable.",
            points: 0,
            consequence: "The team hears a warning. Some people feel anxious. The underlying causes — unclear priorities, heavy workloads, fear of raising problems — remain unchanged. If anything, people are now less likely to flag when they're behind.",
            coaching: "Clarity about expectations matters, but a public warning without addressing the systemic causes treats the symptom, not the problem. If people are missing deadlines because they're overwhelmed or afraid to admit difficulty, more pressure makes those things worse, not better.",
          },
        ],
      },
    ],
  },

  {
    id: 'inclusion',
    tag: 'Inclusion',
    title: 'The New Voice',
    intro: "Your team has recently added two new members — Priya, who joined from a different industry, and Dom, who is the youngest person on the team by several years. Both are clearly capable. But after three months, you've noticed that in meetings, their ideas tend to get talked over, or are picked up by others and credited differently. Neither has been given a stretch project yet. You're also conscious that your three longest-serving team members — all similar in background and style — have a strong gravitational pull in team dynamics.",
    rounds: [
      {
        situation: "In today's meeting, Priya proposes an idea. Two more senior colleagues build on it without acknowledging her contribution. The idea is now being discussed as if it came from one of them. What do you do?",
        choices: [
          {
            label: "Let it go this time — the idea is getting traction, which is what matters. You'll watch to see if it becomes a pattern.",
            points: 0,
            consequence: "The idea moves forward without attribution. Priya notices. She becomes quieter in subsequent meetings. Six months later she asks for a transfer.",
            coaching: "Invisible erasure is one of the most corrosive dynamics in teams — and it compounds. When a leader sees it and stays silent, they send a signal that contribution doesn't need to be acknowledged fairly. Over time, people who experience this stop contributing. The cost is real and largely avoidable.",
          },
          {
            label: "Jump in: \"Before we go further — I want to make sure Priya gets credit for where this started. Priya, do you want to build on your idea yourself?\"",
            points: 2,
            consequence: "There's a brief pause. Priya looks relieved. She adds two important extensions to her original idea. The more senior colleagues are slightly embarrassed but the dynamic in the room shifts. Attribution starts to be more conscious over the following weeks.",
            coaching: "Exactly right. You've done something important: named the attribution in the moment, given Priya the floor, and signalled to the whole team what the standard is. Leaders shape norms through what they visibly reinforce or allow to pass. This one intervention does a lot of work.",
          },
          {
            label: "After the meeting, tell Priya privately: \"I noticed your idea didn't get attributed correctly — that wasn't right.\"",
            points: 1,
            consequence: "Priya appreciates being seen. But the team dynamic hasn't shifted — the colleagues who picked up the idea don't know what happened. The same thing occurs again the following week.",
            coaching: "Acknowledging Priya privately is kind and she'll feel seen, but it doesn't change the team norm. The people who built on her idea without attribution don't receive any signal. What happens in public shapes culture; what happens in private shapes only one relationship.",
          },
        ],
      },
      {
        situation: "You want to give Dom a stretch project — a visible, cross-functional piece of work that could raise their profile. But you're aware some senior stakeholders are less familiar with Dom and may question the choice. What do you do?",
        choices: [
          {
            label: "Hold off for now — better to wait until Dom has had more time to build internal credibility before putting them in a high-visibility role.",
            points: 0,
            consequence: "Six months pass. Dom's profile hasn't grown because they haven't had the opportunities to grow it. The most senior people on the team continue to get the high-profile work. Dom feels stuck.",
            coaching: "The logic feels cautious but the effect is circular: Dom needs visibility to build credibility, but isn't given visibility until they already have credibility. The leader has the power to break this loop — and not breaking it is itself a choice with consequences.",
          },
          {
            label: "Give Dom the project and prepare them well: brief the key stakeholders, give Dom context on the room and the people, and plan regular check-ins to support them through it.",
            points: 2,
            consequence: "Dom delivers. Some stakeholders are pleasantly surprised. Dom's confidence grows visibly. By the end of the quarter they're proactively building relationships across the organisation.",
            coaching: "This is it. You've given Dom a real opportunity and removed the barriers that might have made them fail — not by lowering the bar, but by preparing the ground. Giving stretch opportunities is one of the highest-impact things a leader can do for inclusion. Sponsoring someone actively (managing perceptions, giving context, providing support) is what turns opportunity into success.",
          },
          {
            label: "Give Dom the project and let them sink or swim — you don't want to over-prepare them or make it look like they needed extra help.",
            points: 1,
            consequence: "Dom struggles in one stakeholder meeting where the political dynamics were hard to read without context. Word gets back that it wasn't a smooth delivery. Dom's confidence takes a hit and the stakeholders are more sceptical of future recommendations.",
            coaching: "The intention was good but the execution let Dom down. Equity isn't about treating everyone identically — it's about giving everyone what they need to succeed. More established team members have years of context and relationships. Giving someone new the same opportunity without the same enabling conditions isn't equal; it's just fair-looking.",
          },
        ],
      },
      {
        situation: "You want to change the meeting dynamic so Priya and Dom's voices consistently get heard. What do you put in place?",
        choices: [
          {
            label: "Before the next meeting, ask Priya and Dom to prepare a short section each — so they have a natural, structured moment to speak.",
            points: 2,
            consequence: "Both come prepared and well-received. Over time, the team adjusts its perception of who the contributors are. The informal hierarchy in the room starts to flatten.",
            coaching: "Structural inclusion is powerful. When newer or quieter voices are given a prepared slot rather than having to compete for airtime in a fast-moving discussion, they show up differently — and the team sees them differently. This is a small intervention with a significant culture effect.",
          },
          {
            label: "In the next meeting, deliberately call on Priya and Dom before the more dominant voices get a chance to speak.",
            points: 2,
            consequence: "Both contribute substantively. The more senior team members listen. The order of speaking shifts the weight of each contribution. The dynamic gradually changes over subsequent meetings.",
            coaching: "Voice order matters more than most leaders realise. Whoever speaks first sets the anchor for the discussion — others tend to build on or respond to that view rather than introduce something fresh. Deliberately sequencing voices is one of the most effective tools for inclusion in meetings.",
          },
          {
            label: "Ask everyone in the team to be more mindful about letting others speak and not interrupting.",
            points: 0,
            consequence: "People nod. The first meeting is slightly better. By the third meeting, old patterns have reasserted themselves and the dynamic is back to normal.",
            coaching: "General appeals to mindfulness rarely shift ingrained team dynamics. People revert to habit under pressure. If the goal is real change, the leader needs to actively intervene with structure and clear behavioural signals — not rely on the team self-correcting through good intentions alone.",
          },
        ],
      },
    ],
  },

  {
    id: 'values',
    tag: 'Values',
    title: 'The Grey Area',
    intro: "Your company's stated values include 'We do the right thing' and 'We treat people with respect.' You're reviewing a commercial proposal that would bring in significant revenue. The approach is technically legal, but you have a quiet concern that it involves some misleading framing in how the product's capabilities are described to customers. Your line manager is enthusiastic and has already mentioned it to the exec team. There's a lot of momentum behind it.",
    rounds: [
      {
        situation: "Your gut is telling you something is off about the framing, but no one else has flagged it. What do you do?",
        choices: [
          {
            label: "Trust the process — if it had been a real problem, legal or compliance would have caught it.",
            points: 0,
            consequence: "The proposal moves forward. Six months later, a customer complaint surfaces about expectations not matching what was delivered. It becomes a wider reputational issue that traces back to the original framing.",
            coaching: "Delegating your values instincts to process is one of the ways good organisations end up doing things that don't reflect their stated values. Legal and compliant doesn't mean right. When a leader has a values concern and stays quiet, they've made a choice — just not an explicit one. The 'right thing' value exists precisely for the grey areas that process doesn't catch.",
          },
          {
            label: "Raise the concern privately with your manager before the proposal moves further: \"I want to flag something — I'm not comfortable with how the capabilities are framed. Can we talk about it?\"",
            points: 2,
            consequence: "Your manager is initially defensive but listens. You both look at the framing together. There's an adjustment to the language that keeps the commercial value but removes the misleading element. Your manager actually thanks you.",
            coaching: "Raising it privately first is the right move — it's direct, it's not performative, and it gives your manager the chance to respond without being put on the spot publicly. You've lived the value by acting on it in a moment where momentum made silence much easier. That's what values under pressure look like.",
          },
          {
            label: "Stay quiet for now but document your concern in a brief email to yourself, in case it becomes an issue later.",
            points: 0,
            consequence: "The proposal moves forward. When the problem surfaces later, you have a record — but the damage is done. Your email protects you individually but changed nothing.",
            coaching: "This is self-protection dressed as responsibility. Documenting a concern you didn't act on is a way of managing your own liability rather than living a value. 'We do the right thing' isn't about having a paper trail — it's about doing something when it matters, especially when it's inconvenient.",
          },
        ],
      },
      {
        situation: "Your manager hears your concern but says: \"I get it, but the exec team is already across this and there's a lot of pressure to land this deal. I think we just move forward.\" How do you respond?",
        choices: [
          {
            label: "Defer to your manager — they've heard your concern and made a call. It's not your decision to make.",
            points: 0,
            consequence: "The proposal moves forward. You feel unsettled but tell yourself you did what you could. When the fallout arrives, you're associated with the decision despite having quietly disagreed.",
            coaching: "Escalation does have a stopping point — but this early in the process, deferring to one conversation is a fairly low bar. Your manager has heard your concern but dismissed it under commercial pressure. That's the very situation 'we do the right thing' is meant for. You haven't exhausted your options yet.",
          },
          {
            label: "Ask once more, specifically: \"I hear you on the pressure. Can we at least look at the specific framing — I think there's a version of this that works commercially and doesn't create the risk I'm worried about.\"",
            points: 2,
            consequence: "Your manager pauses. You spend 20 minutes on the document together and find a way to reframe two key claims that addresses your concern. The deal moves forward. Your manager mentions to a colleague that you have good commercial instincts.",
            coaching: "Persistence matters here, but the key is how you persist. You're not digging in on principle — you're offering a practical solution. That's the most effective way to raise a values concern with a manager under pressure: name the specific issue, and bring a path forward. You've turned a potential standoff into a collaboration.",
          },
          {
            label: "Escalate to your manager's manager or to a compliance/ethics channel.",
            points: 1,
            consequence: "The escalation creates tension. Your manager feels blindsided and the relationship cools. The issue is reviewed, and the framing is eventually adjusted — but you're seen by some as someone who went over their manager's head unnecessarily.",
            coaching: "Escalation is sometimes the right call, but skipping a second conversation with your manager is a high-cost move when there's still room to resolve it directly. Raising it once, being dismissed once, and immediately escalating is a fast sequence that can be read as lacking interpersonal judgment. Worth trying once more — specifically — before escalating.",
          },
        ],
      },
      {
        situation: "The proposal is now finalised. Your manager asks you to present it to the client team. How do you approach it?",
        choices: [
          {
            label: "Deliver the presentation as written — you've raised your concerns and they weren't adopted. Your job now is execution.",
            points: 1,
            consequence: "You deliver it. It goes well commercially. But you feel disconnected from what you said. Over time, small compromises like this accumulate and you notice yourself becoming more cynical about the company's values.",
            coaching: "Execution is a reasonable stance once you've raised concerns in good faith. But the cost is often underestimated: repeatedly delivering things that conflict with your values is corrosive over time. This moment is worth a final reflection: is there still a way to present this honestly and effectively? If yes, take it. If not, make peace with the decision you've made.",
          },
          {
            label: "Find a way to present the capabilities accurately within the approved framing — be honest about what the product does well without overstating it.",
            points: 2,
            consequence: "The presentation goes well. You feel like you've found a way to live the value within the constraints. The client asks good questions and comes away with accurate expectations. The relationship starts well.",
            coaching: "Even within a constrained situation, there's usually room to act with integrity. You've found it. This is what it looks like to embody 'we do the right thing' when you don't have full control over the outcome — you do the most honest version of what you're asked to do, and you deliver it with conviction.",
          },
          {
            label: "Tell your manager you're not comfortable presenting it and ask to be taken off the presentation.",
            points: 1,
            consequence: "Your manager is frustrated. Someone else presents it. You've protected your own integrity but the impact on the proposal and the relationship with your manager is real.",
            coaching: "Withdrawing is a values act, and in some situations it's the right one. Here it's an option rather than the only option — and it costs more than finding a way to present it honestly. Before withdrawing entirely, it's worth asking: can I find language that allows me to stand behind this? If not, stepping aside is more principled than performing something you believe is wrong.",
          },
        ],
      },
    ],
  },
]

// ── Level colours ─────────────────────────────────────────────────────────────

const LEVEL_COLOURS = ['#9CA3AF', '#60A5FA', '#34D399', '#FBBF24', '#F59E0B']

const LEVELS = [
  { label: 'Rookie',              minXp: 0    },
  { label: 'Developing Manager',  minXp: 100  },
  { label: 'Capable Manager',     minXp: 300  },
  { label: 'Strong Manager',      minXp: 600  },
  { label: 'Exceptional Manager', minXp: 1000 },
]

// ── Animation styles ──────────────────────────────────────────────────────────

const GAME_STYLES = `
  @keyframes ssiFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ssiScalePop {
    0%   { opacity: 0; transform: scale(0.7); }
    65%  { transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes ssiStarPop {
    0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
    60%  { transform: scale(1.25) rotate(6deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes ssiSlideLeft {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ssiXpCount {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ssiFlashFade {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes ssiFloatUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    55%  { opacity: 1; transform: translateY(-38px) scale(1.15); }
    100% { opacity: 0; transform: translateY(-70px) scale(0.85); }
  }
  @keyframes ssiShake {
    0%, 100% { transform: translateX(0); }
    15%  { transform: translateX(-7px); }
    30%  { transform: translateX(7px); }
    45%  { transform: translateX(-5px); }
    60%  { transform: translateX(5px); }
    75%  { transform: translateX(-3px); }
  }
  @keyframes ssiBestBounce {
    0%   { opacity: 0; transform: scale(0.5); }
    55%  { transform: scale(1.18); }
    75%  { transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes ssiGlowRing {
    0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0.55); }
    50%  { box-shadow: 0 0 0 12px rgba(5,150,105,0.1); }
    100% { box-shadow: 0 0 0 20px rgba(5,150,105,0); }
  }
`

// ── Stars component ───────────────────────────────────────────────────────────

function Stars({ count, size = 18, animate = false }: { count: number; size?: number; animate?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3].map(i => (
        <svg
          key={i} width={size} height={size} viewBox="0 0 20 20"
          fill={i <= count ? '#FBBF24' : '#E5E7EB'}
          style={animate ? { animation: `ssiStarPop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) ${i * 0.13}s both` } : undefined}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ScenarioSimulator({ token }: { token: string }) {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Game state
  const [phase, setPhase] = useState<'idle' | 'intro' | 'choosing' | 'reveal' | 'complete'>('idle')
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [roundIndex, setRoundIndex] = useState(0)
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null)
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ stars: number; xpEarned: number; totalXp: number; currentLevel: string; levelIndex: number } | null>(null)
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null)
  const [revealFlash, setRevealFlash] = useState<'best' | 'good' | 'poor' | null>(null)

  // Pick a random scenario (avoiding the last one played if possible)
  function pickScenario() {
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5)
    return shuffled[0]
  }

  // Load player stats
  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/scenario-simulator', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setStats(await res.json())
    } catch { /* silent */ }
    setLoadingStats(false)
  }

  function startGame() {
    const s = pickScenario()
    setScenario(s)
    setRoundIndex(0)
    setRoundScores([])
    setChoiceIndex(null)
    setResult(null)
    setPhase('intro')
  }

  function beginRound() {
    setChoiceIndex(null)
    setPhase('choosing')
  }

  function selectChoice(idx: number) {
    const pts = scenario!.rounds[roundIndex].choices[idx].points
    const flash: 'best' | 'good' | 'poor' = pts === 2 ? 'best' : pts === 1 ? 'good' : 'poor'
    setRevealFlash(flash)
    setTimeout(() => setRevealFlash(null), 750)
    setChoiceIndex(idx)
    setPhase('reveal')
  }

  async function nextRound() {
    const choice = scenario!.rounds[roundIndex].choices[choiceIndex!]
    const newScores = [...roundScores, choice.points]

    if (roundIndex < scenario!.rounds.length - 1) {
      setRoundScores(newScores)
      setRoundIndex(roundIndex + 1)
      setChoiceIndex(null)
      setPhase('choosing')
    } else {
      // Final round — save
      setSaving(true)
      const totalScore = newScores.reduce((a, b) => a + b, 0)
      try {
        const res = await fetch('/api/scenario-simulator', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId: scenario!.id, score: totalScore }),
        })
        if (res.ok) {
          const data = await res.json()
          setResult({ ...data, xpEarned: data.xpEarned })
          await loadStats()
        }
      } catch { /* silent */ }
      setSaving(false)
      setRoundScores(newScores)
      setPhase('complete')
    }
  }

  const currentRound  = scenario && phase !== 'idle' && phase !== 'intro' ? scenario.rounds[roundIndex] : null
  const selectedChoice = currentRound && choiceIndex !== null ? currentRound.choices[choiceIndex] : null
  const totalScore    = roundScores.reduce((a, b) => a + b, 0) + (selectedChoice?.points ?? 0)

  // ── Idle / lobby ────────────────────────────────────────────────────────────

  if (phase === 'idle') {
    const levelIdx    = stats?.levelIndex ?? 0
    const levelColour = LEVEL_COLOURS[Math.min(levelIdx, LEVEL_COLOURS.length - 1)]
    const nextLevel   = stats?.nextLevel
    const xpForNext   = stats?.xpForNext ?? 0
    const xpProgress  = stats?.xpProgress ?? 0
    const progressPct = xpForNext ? Math.round((xpProgress / xpForNext) * 100) : 100

    return (
      <div style={{ padding: '0 0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#0A2E2A', marginBottom: 2 }}>Play the Simulator</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Ready to put your instincts to the test?</p>
          </div>
          {!loadingStats && stats && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: levelColour, background: `${levelColour}18`, padding: '3px 8px', borderRadius: 20 }}>
                {stats.currentLevel}
              </span>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{stats.totalXp} XP total</p>
            </div>
          )}
        </div>

        {/* XP progress bar */}
        {!loadingStats && stats && stats.nextLevel && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>{stats.xpProgress} / {stats.xpForNext} XP to reach <strong style={{ color: '#6B7280' }}>{stats.nextLevel}</strong></span>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: '#F3F4F6', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: levelColour, width: `${progressPct}%`, transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 5 }}>
              XP (experience points) are earned each time you complete a scenario — the better your responses, the more you earn.
            </p>
          </div>
        )}
        {!loadingStats && stats && !stats.nextLevel && (
          <div style={{ marginBottom: 20, padding: '10px 14px', background: '#FEF5D9', borderRadius: 10, textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>🏆 Max level reached — Exceptional Manager</span>
          </div>
        )}

        {/* Best scores per scenario */}
        {!loadingStats && stats && Object.keys(stats.bestByScenario).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Best</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SCENARIOS.map(s => {
                const best = stats.bestByScenario[s.id]
                if (!best) return null
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#0A2E2A', fontWeight: 500 }}>{s.title}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{s.tag}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stars count={best.stars} size={14} />
                      <span style={{ fontSize: 11, color: '#6B7280' }}>{best.xp_earned} XP</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Play button */}
        <button
          onClick={startGame}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: '#0A2E2A', color: '#fff', fontSize: 14, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}
        >
          {stats && stats.runCount > 0 ? 'Play Again' : 'Start Scenario'}
        </button>
        <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
          3 rounds per scenario · new situation each time
        </p>
      </div>
    )
  }

  // ── Intro ───────────────────────────────────────────────────────────────────

  if (phase === 'intro' && scenario) {
    return (
      <div style={{ padding: '0 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', background: '#F3F4F6', padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {scenario.tag}
          </span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0A2E2A', marginBottom: 12 }}>{scenario.title}</h3>
        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, marginBottom: 24 }}>{scenario.intro}</p>
        <button
          onClick={beginRound}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12,
            background: '#0A2E2A', color: '#fff', fontSize: 14, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}
        >
          Begin
        </button>
      </div>
    )
  }

  // ── Choosing ─────────────────────────────────────────────────────────────────

  if (phase === 'choosing' && scenario && currentRound) {
    return (
      <div style={{ padding: '0 0 24px', animation: 'ssiFadeUp 0.3s ease' }}>
        <style>{GAME_STYLES}</style>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {scenario.rounds.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 5, borderRadius: 3,
              background: i < roundIndex ? '#0A2E2A' : i === roundIndex ? '#0AF3CD' : '#E5E7EB',
              transition: 'background 0.4s ease',
            }} />
          ))}
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Round {roundIndex + 1} of {scenario.rounds.length}
        </p>
        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, marginBottom: 18 }}>{currentRound.situation}</p>

        {/* Prompt */}
        <p style={{ fontSize: 11, fontWeight: 700, color: '#05A88E', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Choose your response ↓
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {currentRound.choices.map((choice, idx) => {
            const hovered = hoveredChoice === idx
            return (
              <button
                key={idx}
                onClick={() => selectChoice(idx)}
                onMouseEnter={() => setHoveredChoice(idx)}
                onMouseLeave={() => setHoveredChoice(null)}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                  border: `1.5px solid ${hovered ? '#0A2E2A' : '#E5E7EB'}`,
                  background: hovered ? '#F0FDF9' : '#fff',
                  fontSize: 13, color: '#374151', lineHeight: 1.55, cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
                  transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: hovered ? '0 4px 14px rgba(10,46,42,0.09)' : 'none',
                  animation: `ssiSlideLeft 0.25s ease ${idx * 0.07}s both`,
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: hovered ? '#0A2E2A' : '#F3F4F6',
                  color: hovered ? '#0AF3CD' : '#9CA3AF',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                  lineHeight: '1',
                }}>
                  {['A', 'B', 'C'][idx]}
                </span>
                <span style={{ flex: 1 }}>{choice.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Reveal ───────────────────────────────────────────────────────────────────

  if (phase === 'reveal' && scenario && currentRound && selectedChoice) {
    const pts = selectedChoice.points
    const ptColour = pts === 2 ? '#059669' : pts === 1 ? '#D97706' : '#DC2626'
    const ptBg     = pts === 2 ? '#F0FDF4' : pts === 1 ? '#FFFBEB' : '#FEF2F2'
    const ptLabel  = pts === 2 ? 'Best move' : pts === 1 ? 'Good instinct' : 'Room to grow'
    const ptIcon   = pts === 2 ? '✓' : pts === 1 ? '~' : '✗'
    const isLast   = roundIndex === scenario.rounds.length - 1

    const flashColour = pts === 2 ? 'rgba(5,150,105,0.13)' : pts === 1 ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)'
    const badgeAnim   = pts === 2 ? 'ssiBestBounce 0.5s cubic-bezier(0.175,0.885,0.32,1.275)'
                      : pts === 0 ? 'ssiShake 0.45s ease'
                      : 'ssiScalePop 0.35s cubic-bezier(0.175,0.885,0.32,1.275)'

    return (
      <>
        <style>{GAME_STYLES}</style>

        {/* Full-screen flash overlay */}
        {revealFlash && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            backgroundColor: flashColour,
            animation: 'ssiFlashFade 0.75s ease forwards',
          }} />
        )}

        <div style={{ padding: '0 0 24px', animation: 'ssiFadeUp 0.25s ease', position: 'relative' }}>

          {/* Floating score indicator */}
          <div style={{
            position: 'absolute', top: 40, right: 0, pointerEvents: 'none',
            fontSize: pts === 2 ? 22 : 18, fontWeight: 900,
            color: ptColour, animation: 'ssiFloatUp 0.85s ease forwards',
          }}>
            {pts === 2 ? '✦ Best move!' : pts === 1 ? '+1 pt' : '✗'}
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {scenario.rounds.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 5, borderRadius: 3,
                background: i <= roundIndex ? '#0A2E2A' : '#E5E7EB',
              }} />
            ))}
          </div>

          {/* Result badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            animation: badgeAnim,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 700, color: ptColour,
              background: `${ptColour}18`, padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${ptColour}35`,
              ...(pts === 2 ? { animation: 'ssiGlowRing 0.7s ease 0.2s' } : {}),
            }}>
              <span style={{ fontSize: 14 }}>{ptIcon}</span> {ptLabel}
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>+{pts} / 2 pts</span>
          </div>

          {/* Coaching */}
          <div style={{
            marginBottom: 22, padding: '13px 15px',
            background: ptBg, borderRadius: 12, borderLeft: `3px solid ${ptColour}`,
            animation: 'ssiFadeUp 0.35s ease 0.15s both',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: ptColour, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Coach says</p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{selectedChoice.coaching}</p>
          </div>

          <button
            onClick={nextRound}
            disabled={saving}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 12,
              background: '#0A2E2A', color: '#fff', fontSize: 14, fontWeight: 600,
              border: 'none', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {saving ? 'Saving…' : isLast ? 'See Results →' : 'Next Round →'}
          </button>
        </div>
      </>
    )
  }

  // ── Complete ─────────────────────────────────────────────────────────────────

  if (phase === 'complete' && scenario && result) {
    const stars        = result.stars
    const levelColour  = LEVEL_COLOURS[Math.min(result.levelIndex, LEVEL_COLOURS.length - 1)]
    const finalScore   = roundScores.reduce((a, b) => a + b, 0)
    const maxScore     = scenario.rounds.length * 2
    const optimalCount = roundScores.filter(s => s === 2).length

    return (
      <div style={{ padding: '0 0 24px', animation: 'ssiFadeUp 0.3s ease' }}>
        <style>{GAME_STYLES}</style>

        {/* Stars */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Stars count={stars} size={36} animate />
        </div>

        {/* Headline */}
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0A2E2A', marginBottom: 4, textAlign: 'center' }}>
          {stars === 3 ? 'Excellent leadership' : stars === 2 ? 'Solid approach' : 'Keep practising'}
        </h3>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18, textAlign: 'center' }}>
          {scenario.title} · {finalScore}/{maxScore} pts · {optimalCount === 3 ? 'all 3 optimal responses' : optimalCount === 0 ? 'keep working at it' : `${optimalCount} of 3 optimal responses`}
        </p>

        {/* Round breakdown */}
        <div style={{ marginBottom: 18, borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {roundScores.map((score, i) => {
            const c = score === 2 ? '#059669' : score === 1 ? '#D97706' : '#DC2626'
            const l = score === 2 ? 'Best move' : score === 1 ? 'Good instinct' : 'Room to grow'
            const icon = score === 2 ? '✓' : score === 1 ? '~' : '✗'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px', background: i % 2 === 0 ? '#fff' : '#F9FAFB',
                borderBottom: i < roundScores.length - 1 ? '1px solid #E5E7EB' : 'none',
                animation: `ssiFadeUp 0.3s ease ${i * 0.1}s both`,
              }}>
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Round {i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: c,
                    background: `${c}12`, padding: '2px 9px', borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {icon} {l}
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', minWidth: 28, textAlign: 'right' }}>{score}/2</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* XP earned */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: `${levelColour}12`, borderRadius: 12,
          marginBottom: 18, border: `1px solid ${levelColour}25`,
          animation: 'ssiXpCount 0.4s ease 0.35s both',
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px' }}>XP earned</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: levelColour, margin: 0, lineHeight: 1 }}>+{result.xpEarned}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px' }}>Your level</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: levelColour, margin: 0 }}>{result.currentLevel}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{result.totalXp} XP total</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={startGame}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              background: '#0A2E2A', color: '#fff', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
            }}
          >
            Play Again →
          </button>
          <button
            onClick={() => setPhase('idle')}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              background: '#F3F4F6', color: '#374151', fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}
          >
            View Stats
          </button>
        </div>
      </div>
    )
  }

  return null
}
