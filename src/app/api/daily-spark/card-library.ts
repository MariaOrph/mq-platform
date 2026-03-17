export type CardContent = { title: string; teaser: string; insight: string; exercise: string }

export const CARD_LIBRARY: Record<number, Record<number, CardContent>> = {
  1: {
    1: {
      title:    'The Mirror Moment',
      teaser:   'See yourself as your team actually sees you.',
      insight:  'Research by Tasha Eurich found that while 95% of leaders believe they are self-aware, only 10–15% actually are. The gap isn\'t lack of intelligence. It\'s that our brains are wired to protect our self-image, filtering out information that challenges how we see ourselves. The most effective leaders actively seek disconfirming data.',
      exercise: 'Think of a recent meeting or decision. Write down: (1) How you think you came across. (2) How you think each person in the room experienced you. (3) One thing someone might have observed that you wouldn\'t want them to. Sit with the discomfort of question 3: that\'s where your self-awareness work lives.',
    },
    2: {
      title:    'The Trigger Map',
      teaser:   'Map what sets you off before it does.',
      insight:  'Emotional triggers bypass the prefrontal cortex, firing a response before conscious thought catches up. Leaders who can name their triggers respond significantly more effectively in high-pressure moments because the act of naming activates the rational brain and re-engages deliberate thinking.',
      exercise: 'List 3 situations at work that reliably produce a strong emotional reaction in you (e.g. being interrupted, plans changing last minute, credit not given). For each: What happens in your body? What story do you tell yourself? What do you do? Now write what a more intentional response would look like for each.',
    },
    3: {
      title:    'Your Leadership Shadow',
      teaser:   'Your mood is your team\'s weather forecast.',
      insight:  'Research by Sigal Barsade at Wharton found that a leader\'s emotional state spreads through a team within minutes of entering a room, directly impacting performance, creativity, and decision-making quality. You are never "just having a bad day" in private: your state is always broadcasting.',
      exercise: 'For the next hour, pay attention to: What emotional tone are you currently projecting? If your team could feel exactly what you\'re feeling, would that help or hinder them? Deliberately choose one small shift: slow your breathing, soften your expression, say something encouraging. Notice what changes in the room.',
    },
    4: {
      title:    'The Blind Spot Scan',
      teaser:   'Ask the question most leaders are afraid to ask.',
      insight:  'The Johari Window model shows that our most impactful blind spots are things others can see about us that we cannot. The only way to access this is to explicitly invite it. Yet fewer than 25% of leaders ever formally ask for blind spot feedback because we fear what we might hear.',
      exercise: 'Send a message today to one trusted colleague: "I\'m working on my leadership. I\'d value one honest observation: something you\'ve noticed about how I show up that I might not be aware of. You can be direct." Then receive it without explaining or defending. Just say thank you. What comes up for you?',
    },
  },
  2: {
    1: {
      title:    'The Opposite View',
      teaser:   'Argue the case you most disagree with.',
      insight:  'Studies on cognitive entrenchment show that expertise, paradoxically, reduces mental flexibility. The more senior a leader, the more likely they are to get locked into a single interpretation. The highest-performing leaders deliberately practise "perspective rotation": generating multiple valid explanations before settling on one.',
      exercise: 'Think of a current challenge you\'re facing, one where you already have a strong view. Now write the strongest possible case for the OPPOSITE position. Not a strawman argument, but a genuinely compelling one. What data supports it? What would a smart person who disagrees say? Does anything shift for you?',
    },
    2: {
      title:    'Assumption Hunt',
      teaser:   'Surface the beliefs quietly driving your decisions.',
      insight:  'Mental models were largely formed before age 25. Research shows that in high-stakes decisions, 60–70% of executives can trace a poor outcome to an untested assumption they never thought to question. The assumption felt so obvious it was invisible.',
      exercise: 'Take a current decision or strategy. Write down 5 assumptions it depends on being true. For each, ask: How do I know this is true? When did I last test it? What would change if it were wrong? Pick the assumption you\'ve tested least recently. What\'s one way to challenge it this week?',
    },
    3: {
      title:    'The Reframe Lab',
      teaser:   'Change the frame and you change what\'s possible.',
      insight:  'When leaders practise intentional reframing, research shows they report lower stress and make measurably better decisions under pressure. A problem framed as a threat activates avoidance; the same problem framed as a challenge activates creativity. The facts don\'t change, but what becomes possible does.',
      exercise: 'Write a current problem in one sentence starting with "I have to…" or "I\'m stuck with…". Now rewrite it 3 ways: (1) As a challenge: "How might I…" (2) As a learning: "This is teaching me…" (3) As a choice: "I\'m choosing to…" Which frame opens up the most possibility? Use that framing going forward.',
    },
    4: {
      title:    'Mental Model Audit',
      teaser:   'Question the rules you forgot you made up.',
      insight:  'Carol Dweck\'s research shows leaders carry implicit "rules" about how leadership should work, often absorbed from their first manager or a formative early experience. These invisible rules (e.g. "showing emotion is weakness", "the leader must have all the answers") can become the biggest constraint on their growth.',
      exercise: 'Complete these sentences without overthinking: "A good leader always…" / "A good leader never…" / "It would be unprofessional to…" / "People respect a leader who…" Now look at each answer and ask: Where did I learn this? Is it still true? Is it still serving me? What would I do differently if I let this rule go?',
    },
  },
  3: {
    1: {
      title:    'The Pause Protocol',
      teaser:   'Build a gap between trigger and response.',
      insight:  'Viktor Frankl wrote: "Between stimulus and response there is a space. In that space is our power to choose." Neuroscience confirms this: the amygdala fires a threat response almost instantly, but the prefrontal cortex takes longer to engage. Your only job is to create that window of pause.',
      exercise: 'Design your personal Pause Protocol. When you feel your emotional temperature rising, you will: (1) Take one slow breath, in for 4 counts, out for 6. (2) Say internally: "I notice I\'m feeling [emotion]." (3) Ask: "What response would I be proud of in hindsight?" Practise this in ONE moment today, even a small one.',
    },
    2: {
      title:    'Name It to Tame It',
      teaser:   'Labelling an emotion reduces its power immediately.',
      insight:  'UCLA neuroscientist Matthew Lieberman showed that simply labelling an emotion ("I feel anxious", not "I am anxious") reduces amygdala activation significantly. The distinction matters: "I am anxious" fuses your identity with the feeling; "I feel anxious" creates separation. That separation is where regulation begins.',
      exercise: 'For the rest of today, practise emotional granularity: naming emotions precisely. Instead of "stressed", is it overwhelmed, frustrated, anxious, pressured, or irritated? Each has a different cause and solution. Every hour, write the most accurate word for what you\'re feeling. At the end of the day, what patterns do you notice?',
    },
    3: {
      title:    'The Energy Audit',
      teaser:   'Track what drains you before it depletes you.',
      insight:  'Research by the Energy Project found that leaders\' cognitive performance degrades sharply after sustained emotional expenditure, not just physical effort. Leaders who actively manage their energy (not just their time) consistently make better decisions and sustain higher performance.',
      exercise: 'Map your last 2 days into two columns: Energy In (what gave you energy: a conversation, a task, a moment of flow) and Energy Out (what drained you). Now: (1) Identify one draining activity you could reduce or delegate. (2) Identify one energising activity you could do more of. Commit to one concrete change this week.',
    },
    4: {
      title:    'Regulate to Lead',
      teaser:   'Your calm is your team\'s greatest resource.',
      insight:  'When a leader is visibly dysregulated (stressed, anxious, reactive), their team\'s capacity for clear thinking drops measurably. This is co-regulation: our nervous systems are designed to sync with those around us. A regulated leader doesn\'t just feel better; they literally improve their team\'s ability to think and perform.',
      exercise: 'Identify your most reliable regulation technique: the one thing that reliably brings you back to centre in under 5 minutes (e.g. 3 slow breaths, a short walk, cold water, a specific song). If you don\'t have one, that\'s the work. Today: test 3 options and note which most quickly shifts your physical state. Make it your go-to protocol.',
    },
  },
  4: {
    1: {
      title:    'The Values Audit',
      teaser:   'Uncover the values quietly running your decisions.',
      insight:  'Research shows most leaders can name their values but fewer than 30% can describe how those values show up in their actual decisions. The gap between stated values and enacted values is the single biggest source of leadership inconsistency, and your team notices it, even when they never say so.',
      exercise: 'Write your top 5 values as a leader. Then review your calendar and key decisions from the last 3 days. Next to each value mark: ✓ it showed up clearly, ✗ it was absent or compromised, ? you\'re not sure. Where are the gaps? Pick the one gap that feels most significant. Write one thing you\'ll do differently this week.',
    },
    2: {
      title:    'Values Under Pressure',
      teaser:   'Find out what you really value when it\'s hard.',
      insight:  'Jonathan Haidt\'s research shows that under pressure, most people default to convenience values: speed, comfort, approval, rather than their stated values. True values clarity means knowing in advance where your lines are, so you don\'t negotiate them away in the moment when it\'s hardest to hold them.',
      exercise: 'Think of the last time you made a decision under time or social pressure. Write: (1) What did you decide? (2) Which of your values did it reflect? (3) Which values, if any, did you compromise? Now write down what decision you\'re facing right now where you might choose convenience over integrity. Write down what integrity looks like in that moment.',
    },
    3: {
      title:    'Your Non-Negotiables',
      teaser:   'Define your lines before you\'re asked to cross them.',
      insight:  'Leaders without clearly defined non-negotiables are more susceptible to gradual ethical drift: small compromises that seem reasonable in isolation but accumulate into significant deviations. Having explicit, pre-committed non-negotiables protects against the rationalisation that high-pressure moments invite.',
      exercise: 'Complete this sentence 5 times: "No matter what, I will never…" These are your non-negotiables as a leader. Now think of a situation in the next month where one of these might be tested. Write down exactly what you will say or do if someone asks you to cross that line. Rehearsing the response in advance makes it far more likely you\'ll hold it.',
    },
    4: {
      title:    'The Values Gap',
      teaser:   'Close the gap between who you say you are and how you lead.',
      insight:  '360-degree feedback studies consistently show that the biggest gap between how leaders see themselves and how their teams see them is around values-based behaviour. Leaders believe they demonstrate their stated values more consistently than their teams observe. This gap, not the values themselves, is what erodes trust over time.',
      exercise: 'Pick one of your core values (e.g. respect, honesty, growth). If you asked three members of your team to rate how consistently you demonstrate this value out of 10, what score would they give? What specific behaviour from the last month would they point to as evidence? Write your honest answer. Is that score acceptable to you?',
    },
  },
  5: {
    1: {
      title:    'The Trust Inventory',
      teaser:   'Map the trust in your most important relationships.',
      insight:  'Paul Zak\'s neuroscience research shows that high-trust teams are significantly less stressed, more productive, and more engaged than low-trust teams. Trust is built through small, consistent actions, not grand gestures. The single biggest driver is following through on small commitments, every time.',
      exercise: 'List your 5 most important working relationships. For each, rate trust out of 10 from your perspective. For any rated below 7: write one specific thing you could do this week to build trust. For any rated 8 or above: write one thing that would damage that trust, and make a commitment to avoid it.',
    },
    2: {
      title:    'Listening Deeper',
      teaser:   'Listen to understand, not to respond.',
      insight:  'Studies show the average leader listens for just 17 seconds before redirecting the conversation. This isn\'t rudeness; it\'s how brains are wired. The prefrontal cortex generates a response almost immediately, and once it does, we stop fully absorbing what\'s being said. The most respected leaders train themselves to go one level deeper.',
      exercise: 'In your next significant conversation, set an internal challenge: do not speak until the other person has finished AND you\'ve waited 3 seconds. During those 3 seconds, ask yourself: "What is this person most trying to be understood about?" Then respond to THAT, not to the surface content. Afterwards: what did you hear that you might otherwise have missed?',
    },
    3: {
      title:    'The Appreciation Effect',
      teaser:   'Recognition is the most underused leadership tool.',
      insight:  'Gallup research shows that employees who receive specific, genuine recognition from their leader at least once a week are 5 times less likely to leave and 4 times more likely to be highly engaged. Despite this, 65% of employees report receiving no meaningful recognition in the past year. The barrier isn\'t time; it\'s leaders underestimating the impact.',
      exercise: 'Identify 3 people who have done something worth recognising in the last 2 weeks: something you noticed but haven\'t mentioned. Write each of them a specific, genuine message today. Avoid vague praise: "great job" lands weakly. Instead: "I noticed [specific thing]. It made a difference because [concrete impact]. Thank you."',
    },
    4: {
      title:    'Bridge the Distance',
      teaser:   'Close the gap that hierarchy quietly creates.',
      insight:  'Research on psychological distance shows that as seniority increases, leaders become systematically less aware of their team\'s day-to-day reality. Information is filtered upward, people manage impressions, and leaders lose their grip on what\'s actually happening. The most effective leaders actively design ways to close this gap.',
      exercise: 'Have one unscheduled, informal conversation with someone on your team today: not about tasks or deliverables, but about them. Ask one of these: "What\'s getting in your way right now that I might be able to help with?" or "If you could change one thing about how we work, what would it be?" Then just listen; don\'t fix, defend, or explain.',
    },
  },
  6: {
    1: {
      title:    'The Bounce-Back Blueprint',
      teaser:   'Build your recovery plan before you need it.',
      insight:  'Research by Martin Seligman shows that resilience is not a trait; it\'s a practice. Resilient leaders don\'t experience fewer setbacks; they have shorter recovery times. The key variable is explanatory style: leaders who see setbacks as temporary and specific recover faster than those who see them as permanent and pervasive.',
      exercise: 'Think of a recent setback. Analyse it using the 3P framework: Is this Permanent ("this always happens") or Temporary ("this happened this time")? Pervasive ("everything is affected") or Specific ("this one area is affected")? Personal ("I am the problem") or do external factors contribute? Now rewrite the story using the more accurate, specific framing.',
    },
    2: {
      title:    'Reframe the Setback',
      teaser:   'Find the data in the difficulty.',
      insight:  'Carol Dweck\'s growth mindset research shows that leaders who view challenges as information, rather than verdicts, outperform their peers over time. The distinguishing question isn\'t "why did this happen to me?" but "what can I learn from this?" This isn\'t toxic positivity; it\'s strategic information extraction from experience.',
      exercise: 'Identify one current challenge or recent failure you haven\'t fully processed. Write answers to: (1) What specifically went wrong? (2) What did I contribute to this? (3) What did I learn that I didn\'t know before? (4) What would I do differently? (5) What unexpected strength did I discover? Notice how your relationship to the setback shifts as you answer.',
    },
    3: {
      title:    'The Uncertainty Edge',
      teaser:   'Get comfortable with what you can\'t control.',
      insight:  'A study of senior executives found that tolerance for ambiguity is the single strongest predictor of effective leadership in complex, fast-moving organisations: stronger than IQ or technical skill. Yet most leadership development focuses on clarity and decisiveness, not on the ability to hold uncertainty without it destabilising performance.',
      exercise: 'Write the 3 things causing you the most anxiety or uncertainty right now. For each, create two columns: What I can control, and What I cannot control. Circle one "can control" item per worry and commit to acting on it today. For each "cannot control" item, write: "I choose to hold this uncertainty without forcing a resolution right now."',
    },
    4: {
      title:    'Strength Under Pressure',
      teaser:   'Know exactly who you are when it gets hard.',
      insight:  'Research on post-traumatic growth shows that the key variable in resilience is narrative: the story people tell about who they became through difficulty. Leaders who can articulate how past challenges shaped their capabilities are significantly more likely to perform effectively in future high-pressure situations.',
      exercise: 'Think of the hardest professional challenge you\'ve faced. Write: (1) What was the situation? (2) What did you have to draw on or develop to get through it? (3) What strength do you have now that you didn\'t have before? (4) How is that strength available to you today? This is your resilience story: know it, and you can call on it under any future pressure.',
    },
  },
}

export function getDimOrder(scores: (number | null)[]): number[] {
  return scores
    .map((s, i) => ({ s: s ?? 999, id: i + 1 }))
    .sort((a, b) => a.s - b.s)
    .map(d => d.id)
}

export function getDimForCard(cardNumber: number, dimOrder: number[]): number {
  return dimOrder[Math.floor((cardNumber - 1) / 4)]
}

export function getCardVariant(cardNumber: number): number {
  return ((cardNumber - 1) % 4) + 1
}
