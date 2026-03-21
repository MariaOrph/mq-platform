export type CardContent = { title: string; teaser: string; insight: string; exercise: string }

// 7 dimensions × 4 cards = 28 MQ cards
// Dimension order:
//   1 = Self-awareness
//   2 = Ego & identity      (new)
//   3 = Emotional regulation
//   4 = Cognitive flexibility (was 2)
//   5 = Values & purpose     (was 4)
//   6 = Relational mindset   (was 5)
//   7 = Adaptive resilience  (was 6)

export const CARD_LIBRARY: Record<number, Record<number, CardContent>> = {
  // ── 1: Self-awareness ────────────────────────────────────────────────────
  1: {
    1: {
      title:    'The Mirror Moment',
      teaser:   'See yourself as your team actually sees you.',
      insight:  'Research by Tasha Eurich found that while 95% of leaders believe they are self-aware, only 10–15% actually are. The gap is not lack of intelligence. It is that our brains are wired to protect our self-image, filtering out information that challenges how we see ourselves. The most effective leaders actively seek disconfirming data.',
      exercise: 'Pick a recent meeting or decision. Answer these three questions in writing:\n\n1. How do you think you came across? (e.g. confident, distracted, decisive, dismissive)\n2. Name one person who was there. How do you think they experienced you specifically?\n3. Write one thing you did or said that, if you\'re honest, you would rather they hadn\'t noticed.\n\nSit with question 3 for a moment without justifying it. That discomfort is exactly where your self-awareness work lives. You don\'t need to fix it today, just see it clearly.',
    },
    2: {
      title:    'The Trigger Map',
      teaser:   'Map what sets you off before it does.',
      insight:  'Emotional triggers bypass the prefrontal cortex, firing a response before conscious thought catches up. Leaders who can name their triggers respond significantly more effectively under pressure because the act of naming activates the rational brain and re-engages deliberate thinking.',
      exercise: 'Below are common leadership triggers. Tick any that reliably produce a strong reaction in you:\n\nBeing interrupted · Plans changing at short notice · Credit not being given · Being micromanaged · Someone undermining you publicly · Vague or moving goalposts · Feeling excluded from decisions · Poor preparation by others · Passive resistance · Being challenged in front of others\n\nPick your top 2. For each one, write:\n- What happens in your body when it fires? (e.g. chest tightens, voice rises, you go quiet)\n- What story do you tell yourself in that moment?\n- What do you typically do as a result?\n- What would a more intentional response look like?\n\nKnowing this in advance is the difference between reacting and responding.',
    },
    3: {
      title:    'Your Leadership Shadow',
      teaser:   'Your mood is your team\'s weather forecast.',
      insight:  'In Primal Leadership, Goleman, Boyatzis and McKee established that a leader\'s emotional tone is the single biggest driver of team climate — and that climate directly accounts for up to 30% of business performance. Self-awareness is the prerequisite: you cannot deliberately manage the shadow you are casting if you cannot first see it clearly.',
      exercise: 'Right now, before you do anything else, rate your current emotional state:\n\nEnergy: 1 (flat) to 10 (high)\nFocus: 1 (scattered) to 10 (sharp)\nMood: 1 (low) to 10 (positive)\n\nNow ask: if your team could feel exactly what you\'re feeling, would that help or hinder them today?\n\nIf your score is below 6 on any dimension, choose one of these micro-shifts:\n- Take 5 slow breaths before your next interaction\n- Write down one thing that is genuinely going well\n- Tell someone something specific you appreciate about their work\n- Step outside for 3 minutes\n\nNotice what changes in the room after you\'ve made the shift.',
    },
    4: {
      title:    'The Blind Spot Scan',
      teaser:   'Ask the question most leaders are afraid to ask.',
      insight:  'The Johari Window model shows that our most impactful blind spots are things others can see about us that we cannot. The only way to access this is to explicitly invite it. Yet fewer than 25% of leaders ever formally ask for blind spot feedback, because we fear what we might hear.',
      exercise: 'Choose one trusted colleague, direct report, or peer, ideally someone who sees you lead regularly.\n\nSend them this message today (copy it exactly if you like):\n\n"I\'m doing some work on how I show up as a leader. I\'d really value one honest observation from you: something you\'ve noticed about how I come across that I might not be fully aware of. You can be direct, I genuinely want to know."\n\nWhen they respond: do not explain, justify, or minimise what they say. Just say thank you.\n\nAfterwards, write down: What did you hear? What was your instinctive reaction? What would it mean if they were right?',
    },
  },

  // ── 2: Ego & identity ────────────────────────────────────────────────────
  2: {
    1: {
      title:    'The Defence Response',
      teaser:   'Notice what you protect — and what it costs you.',
      insight:  'Robert Kegan and Lisa Laskow Lahey\'s research on "immunity to change" shows that most leadership development failures are not caused by a lack of skill. They are caused by hidden commitments to protecting our self-image: the need to appear competent, to be right, to avoid looking uncertain. These protective impulses are entirely human — but they are also the most consistent brake on growth.',
      exercise: 'Recall a recent moment when someone challenged your idea, decision, or judgement. It might have been a direct challenge or something subtler — a question that felt like a test, a comment that stung slightly.\n\nWrite down:\n1. What specifically happened? (Just the facts.)\n2. What was your immediate internal reaction? (Be honest — irritation, dismissal, defensiveness?)\n3. What did you say or do?\n4. What would you have done differently if you had no ego investment in being right?\n\nThe gap between questions 3 and 4 is where your ego is working. The awareness of that gap is already a shift.',
    },
    2: {
      title:    'The Need to Be Right',
      teaser:   'What would change if being understood mattered more than winning?',
      insight:  'Neuroscience shows that social threats — being wrong in public, losing status, being challenged — activate the same threat response as physical danger. The brain floods with cortisol, the prefrontal cortex partially shuts down, and we become less able to think clearly precisely when we most need to. Carol Dweck\'s research adds another layer: when identity is built around being smart or capable, being wrong stops feeling like information and starts feeling like annihilation. The need to be right is not a character flaw; it is biology fused with identity. But once you can see it clearly, it can be worked with.',
      exercise: 'Identify a conversation or situation coming up in the next few days where you are likely to have a strong view — a decision to be made, a direction being debated, a meeting where you expect pushback.\n\nBefore it happens, write down:\n1. What is your position?\n2. What is the strongest possible argument against it?\n3. If you are wrong, what would that mean? (Write the fear out explicitly.)\n4. What is more important in this situation — being right, or reaching the best outcome?\n\nGo into the conversation with one deliberate intention: to understand before being understood. Afterwards, note what changed.',
    },
    3: {
      title:    'Leading From Purpose, Not Fear',
      teaser:   'Are your decisions driven by what you want — or what you want to avoid?',
      insight:  'Much of what looks like leadership conviction is actually fear-based behaviour in disguise. The leader who dominates discussion may be afraid of losing influence. The one who over-prepares may be afraid of looking incompetent. The one who avoids difficult conversations may be afraid of conflict or rejection. Performance psychologist Michael Gervais calls this FOPO — Fear of Other People\'s Opinions — and his research shows it is one of the most consistent limiters of bold leadership: the habitual need for external validation progressively narrows the decisions leaders are willing to make. Brené Brown\'s research confirms: fear-based leadership consistently produces lower trust, lower performance, and higher attrition.',
      exercise: 'Look at some recent decisions — pick three significant ones, they can be small.\n\nFor each decision, honestly answer:\n"Was this decision primarily driven by what I wanted to create or achieve — or by what I wanted to avoid or protect against?"\n\nScore each: 1 = mostly fear-driven, 5 = mostly purpose-driven.\n\nFor any scored 1–3, ask: what specifically was I afraid of? And: what would I have decided if that fear were not present?\n\nThis is not about self-criticism. It is about getting precise about what is actually driving you.',
    },
    4: {
      title:    'The Vulnerability Edge',
      teaser:   'The thing that feels weakest is often your greatest leadership asset.',
      insight:  'Brené Brown\'s decade of research on leadership found that the leaders rated most trustworthy, most inspiring, and most effective were not the ones who projected certainty and control. They were the ones willing to say "I don\'t know", "I got that wrong", "I need your help". Vulnerability — not as oversharing, but as honest acknowledgment of uncertainty — builds the psychological safety that makes teams perform.',
      exercise: 'There are three questions most leaders never ask their team. Choose one and ask it today:\n\n"What\'s one thing I do that makes your work harder?"\n"Is there something I\'ve done recently that didn\'t land the way I intended?"\n"What\'s something you wish I did differently as your leader?"\n\nThe rule: when they answer, say "thank you" and nothing else. No defending, explaining, or contextualising.\n\nAfterwards, write down what you heard and what it tells you. The act of asking — and listening without defending — is itself a leadership shift.',
    },
  },

  // ── 3: Emotional regulation ──────────────────────────────────────────────
  3: {
    1: {
      title:    'The Pause Protocol',
      teaser:   'Build a gap between trigger and response.',
      insight:  'Viktor Frankl wrote: "Between stimulus and response there is a space. In that space is our power to choose." Neuroscience confirms this: the amygdala fires a threat response almost instantly, but the prefrontal cortex takes longer to engage. Stephen Porges\'s Polyvagal research explains precisely why the breathing technique in this exercise works: a slow, extended exhale activates the vagal brake, shifting the nervous system from sympathetic activation (fight/flight) toward ventral vagal (calm, social, clear-headed). This is not relaxation — it is a direct physiological intervention. Your job is simply to use it before you need it.',
      exercise: 'Build your personal Pause Protocol right now. Decide in advance what you will do in the moment your emotional temperature rises:\n\nStep 1: What is your physical signal? (e.g. tension in jaw, heat in chest, voice getting sharper)\nStep 2: Your breath reset: breathe in for 4 counts, hold for 2, out for 6.\nStep 3: Name it internally: "I notice I\'m feeling [word]."\nStep 4: Ask yourself: "What response would I be proud of in 24 hours?"\n\nWrite down your personal version of each step so it is specific to you.\n\nThen: identify one situation today, even a small one, where you will deliberately practise it. The protocol only works if it is rehearsed before you need it.',
    },
    2: {
      title:    'Name It to Tame It',
      teaser:   'The more precisely you name it, the less power it has.',
      insight:  'UCLA neuroscientist Matthew Lieberman showed that labelling an emotion precisely reduces amygdala activation significantly. Lisa Feldman Barrett\'s research deepens this: emotions are not fixed programs that happen to you — they are predictions the brain constructs based on past experience and available concepts. The richer your emotional vocabulary, the more precise and useful the prediction, and the more regulated your response. Leaders with a wider range of emotion words available to them are measurably more resilient under pressure. This exercise is not just naming — it is building the internal precision that makes regulation possible.',
      exercise: 'Most leaders use 3–5 emotion words for everything. Try these more precise alternatives:\n\nInstead of "stressed": overwhelmed · pressured · stretched · frantic · burnt out\nInstead of "annoyed": frustrated · irritated · dismissed · disrespected · impatient\nInstead of "worried": anxious · uncertain · apprehensive · unsettled · fearful\nInstead of "fine": content · calm · focused · satisfied · energised\n\nFor the next hour, practise naming your emotional state with precision. Every time you notice a feeling, choose the most accurate word from this kind of vocabulary.\n\nAt the end of the hour, ask: what pattern do you notice? What is the feeling most reliably pointing to? What does it need from you?',
    },
    3: {
      title:    'The Energy Audit',
      teaser:   'Track what drains you before it depletes you.',
      insight:  'Research by the Energy Project found that leaders\' cognitive performance degrades sharply after sustained emotional expenditure, not just physical effort. Paul Gilbert\'s research adds structural precision: most leaders operate with chronically overactive Threat and Drive systems (detecting danger, pursuing goals) and an underdeveloped Soothe system — the emotional state associated with genuine recovery, perspective, and creativity. The items that drain you in this audit are almost always Threat or Drive activators. The ones that restore you are Soothe activators. Leaders who actively manage their energy, not just their time, consistently make better decisions and sustain higher performance.',
      exercise: 'Draw two columns. Label them Energy In and Energy Out.\n\nLook back at a recent few days of work. Write down every meeting, task, conversation, and interaction you can recall, placing each in the column that reflects how it left you feeling.\n\nEnergy In examples: a productive 1:1, solving a hard problem, a moment of creative flow, genuine connection with someone\nEnergy Out examples: a pointless meeting, a difficult email thread, unclear priorities, managing someone\'s anxiety, context-switching constantly\n\nNow:\n1. Identify one draining item you could reduce, remove, or delegate\n2. Identify one energising item you could do more of or protect better\n3. Write one concrete change you will make this week, and put it in your calendar',
    },
    4: {
      title:    'Regulate to Lead',
      teaser:   'Your calm is your team\'s greatest resource.',
      insight:  'Sigal Barsade\'s research at Wharton found that a leader\'s emotional state spreads through a team within minutes of entering a room — directly shaping performance, creativity, and decision quality. This is emotional contagion: our nervous systems are designed to sync with those around us, especially those in authority. Bessel van der Kolk\'s research adds a critical practical insight: when the nervous system is highly activated, cognitive strategies alone are often insufficient — the body can override the thinking mind before it even engages. The physical regulation techniques in this exercise (breath, cold water, movement, silence) are not complementary extras. For a highly activated nervous system, they are the primary intervention.',
      exercise: 'Identify your most reliable regulation technique by testing these options:\n\n- 3 slow breaths (in for 4, out for 6)\n- A 5-minute walk outside\n- Cold water on your face or wrists\n- Writing down exactly what you\'re feeling\n- 2 minutes of complete silence\n- Naming 5 things you can see right now\n\nIf you already have a go-to, write it down explicitly so it is concrete and committed.\n\nIf you do not yet have one, try 2 or 3 from the list today and note which most quickly shifts your physical state.\n\nThe goal is a personal protocol you can access within 5 minutes, anywhere, any time.',
    },
  },

  // ── 4: Cognitive flexibility (was 2) ─────────────────────────────────────
  4: {
    1: {
      title:    'The Opposite View',
      teaser:   'Argue the case you most disagree with.',
      insight:  'Studies on cognitive entrenchment show that expertise, paradoxically, reduces mental flexibility. The more senior a leader, the more likely they are to get locked into a single interpretation. The highest-performing leaders deliberately practise perspective rotation: generating multiple valid explanations before settling on one.',
      exercise: 'Identify a current situation where you have a strong, fixed view. It might be a strategy decision, a judgement about a person, or a conclusion you\'ve reached about why something isn\'t working.\n\nWrite your current position in one sentence.\n\nNow write the strongest possible case for the opposite view. Not a weak strawman but a genuinely compelling argument. Ask yourself:\n- What evidence supports this alternative view?\n- Who is a smart person who holds this view, and why?\n- What might I be missing or filtering out?\n- What would have to be true for them to be right?\n\nDoes anything shift? You don\'t have to change your view, but you should be able to hold both.',
    },
    2: {
      title:    'Assumption Hunt',
      teaser:   'Surface the beliefs quietly driving your decisions.',
      insight:  'Mental models are largely formed before age 25. Research shows that in high-stakes decisions, 60–70% of executives can trace a poor outcome to an untested assumption they never thought to question. The assumption felt so obvious it was invisible. Philip Tetlock\'s superforecasting research adds a precise solution: the highest-performing thinkers actively hunt for evidence that would prove them wrong. They treat their assumptions as hypotheses, not facts — and update quickly when reality pushes back.',
      exercise: 'Choose a current decision or strategy you\'re working on.\n\nWrite down 5 assumptions it depends on being true. Start each with "I\'m assuming that..."\n\nFor example: "I\'m assuming that the team has capacity for this." / "I\'m assuming the market wants what we\'re building." / "I\'m assuming people understood what I asked for."\n\nFor each assumption, ask:\n- How do I know this is true?\n- When did I last actually test it?\n- What would change if it were wrong?\n\nNow pick the assumption you have tested least recently. What is one thing you could do this week to challenge it with real data?',
    },
    3: {
      title:    'The Reframe Lab',
      teaser:   'Change the frame and you change what\'s possible.',
      insight:  'When leaders practise intentional reframing, research shows they report lower stress and make measurably better decisions under pressure. A problem framed as a threat activates avoidance; the same problem framed as a challenge activates creativity. Adam Grant\'s research on intellectual humility shows that reframing requires separating your identity from your current position — the moment your view becomes who you are, changing it feels like losing. Roger Martin\'s integrative thinking research shows the highest form of this: holding two contradictory framings simultaneously long enough to produce a third option that neither alone would generate. The facts do not change, but what becomes possible does.',
      exercise: 'Write a current problem in one sentence. Start it with "I have to..." or "I\'m stuck with..."\n\nNow rewrite it four ways:\n1. As a challenge: "How might I..."\n2. As a learning: "This is teaching me..."\n3. As a choice: "I\'m choosing to..."\n4. As a question: "What if..."\n\nFor example: "I have to deal with a difficult stakeholder" becomes "How might I build a better working relationship with this person?" or "This is teaching me how to influence without authority."\n\nWhich frame opens up the most energy and possibility? Use that framing for the rest of the week.',
    },
    4: {
      title:    'Mental Model Audit',
      teaser:   'Question the rules you forgot you made up.',
      insight:  'Carol Dweck\'s research shows leaders carry implicit "rules" about how leadership should work, often absorbed from their first manager or a formative early experience. These invisible rules (e.g. "showing emotion is weakness", "the leader must have all the answers") can become the biggest constraint on their growth.',
      exercise: 'Complete these sentences quickly, without overthinking:\n\n"A good leader always..."\n"A good leader never..."\n"It would be unprofessional to..."\n"People respect a leader who..."\n"Asking for help means..."\n"Showing emotion at work is..."\n\nNow look at each answer and ask:\n- Where did I learn this?\n- Is it actually true, or just familiar?\n- Is it still serving me and the people I lead?\n- What would I do differently if I quietly let this rule go?\n\nChoose one rule to consciously test this week.',
    },
  },

  // ── 5: Values & purpose (was 4) ──────────────────────────────────────────
  5: {
    1: {
      title:    'Name What You Stand For',
      teaser:   'You cannot lead from values you have not named.',
      insight:  'Research shows most leaders can name their values but fewer than 30% can describe how those values show up in their actual decisions. Shalom Schwartz\'s cross-cultural values research adds a crucial insight: values exist in a structure of inherent trade-offs. Honesty can conflict with kindness. Achievement can conflict with relationships. Security can conflict with freedom. Leaders who have not resolved which values sit above others will default to whichever feels most urgent in the moment — producing behaviour that feels inconsistent to the people around them. Naming your values is the beginning. Knowing your hierarchy is what makes them load-bearing.',
      exercise: 'From the list below, choose the 5 values that feel most true to who you are as a leader:\n\nIntegrity · Accountability · Courage · Honesty · Growth · Creativity · Fairness · Connection · Empathy · Impact · Excellence · Authenticity · Humility · Resilience · Service · Curiosity · Innovation · Trust · Generosity · Loyalty · Directness · Compassion · Ambition · Collaboration\n\nNow narrow to your top 3. For each one, complete this sentence:\n"[Value] shows up in my leadership when I _____"\n\nFinally, look at your calendar for the last 3 days. For each of your top 3 values, find one moment where it showed up clearly, and one moment where it was absent or compromised.\n\nThe gap between those two lists is your development edge.',
    },
    2: {
      title:    'Values Under Pressure',
      teaser:   'Find out what you really value when it costs you something.',
      insight:  'Jonathan Haidt\'s research shows that under pressure, most people default to convenience values: speed, comfort, approval, rather than their stated values. True values clarity means knowing in advance where your lines are, so you do not negotiate them away in the moment when it is hardest to hold them.',
      exercise: 'Think of a recent decision you made under time pressure or social pressure. It does not need to be dramatic, just a moment where you felt pulled in different directions.\n\nWrite:\n1. What did you decide?\n2. Which of your values did it reflect?\n3. Which values, if any, did you compromise or sidestep?\n\nNow identify a decision you are facing in the next 2 weeks where the same tension might appear. It might involve: telling someone something they do not want to hear · pushing back on a request · making a call before you have full information · choosing the slower, harder right thing over the faster, easier option.\n\nWrite down what acting from your values looks like in that specific situation.',
    },
    3: {
      title:    'Your Why',
      teaser:   'The clearest leaders know what they are ultimately in service of.',
      insight:  'Viktor Frankl\'s research produced one of psychology\'s most important insights: those who survived extreme adversity were not the physically strongest but those with a clear sense of why their life mattered — a purpose beyond their own suffering. William Damon\'s Stanford research extends this: beyond-the-self purpose — contributing to something larger than personal success — is empirically more durable than self-focused goals. Leaders anchored in contribution show greater persistence through adversity and inspire significantly higher commitment from the people around them. The question is not whether you have a purpose, but whether what you are building is genuinely bigger than you.',
      exercise: 'Set a timer for 10 minutes and write freely on this question:\n\n"Why do I lead? Not what I do, or how I do it — but why. What am I ultimately trying to create, build, or contribute to through my leadership?"\n\nWhen the timer ends, read back what you wrote. Underline the phrases that feel most true.\n\nNow write one sentence that begins: "I lead because..."\n\nThis is not a final answer — it is the beginning of a question you should keep asking. But having it written makes it more real. Test it: does it help you make a decision you\'re currently uncertain about?',
    },
    4: {
      title:    'The Values Gap',
      teaser:   'Close the space between who you say you are and how you lead.',
      insight:  '360-degree feedback studies consistently show that the biggest gap between how leaders see themselves and how their teams experience them is around values-based behaviour. Leaders believe they demonstrate their stated values more consistently than their teams observe. Adam Grant\'s research on pro-social motivation adds another dimension: leaders whose purpose is anchored in contributing to others — not just achieving for themselves — are rated significantly higher on trustworthiness and inspire more sustained effort from their teams. The gap is almost never about intent. It is about whether values are visible in behaviour, and whether others can feel that the leader is genuinely oriented toward them.',
      exercise: 'Pick one of your core values. Choose something you care about being known for as a leader, for example: fairness, transparency, support, courage, or follow-through.\n\nNow rate yourself honestly out of 10: how consistently do you actually demonstrate this value in your daily behaviour?\n\nNext, estimate: if three people who work closely with you were asked the same question, what score would they give you?\n\nWrite down:\n- One specific thing you did in the last month that supports a high score\n- One specific thing you did (or failed to do) that would lower your score\n- One behaviour change you could make this week that would close the gap\n\nThis is not about self-criticism. It is about precision.',
    },
  },

  // ── 6: Relational mindset (was 5) ────────────────────────────────────────
  6: {
    1: {
      title:    'The Trust Inventory',
      teaser:   'Map the trust in your most important relationships.',
      insight:  'Paul Zak\'s neuroscience research shows that high-trust teams are significantly less stressed, more productive, and more engaged. Robert Waldinger\'s 80-year Harvard Study of Adult Development found that relationship quality — not wealth, status, or professional achievement — is the single strongest predictor of long-term wellbeing and cognitive health. The implication for leaders is direct: investing in the quality of relationships is not a soft priority alongside the real work. It is the highest-return investment you can make. Trust is built through small, consistent actions, not grand gestures. The single biggest driver is following through on small commitments, every time.',
      exercise: 'List your 5 most important working relationships right now (direct reports, peers, stakeholders, or your manager).\n\nFor each person, rate the current trust level out of 10 from your perspective.\n\nFor any rated 6 or below:\n- Write one specific thing that damaged trust (even if you did not intend it)\n- Write one concrete action you will take this week to begin rebuilding it\n\nFor any rated 8 or above:\n- Write one thing that could damage that trust if you are not careful\n- Write what you are committed to doing to protect it\n\nTrust is not a feeling; it is a track record. What does yours show?',
    },
    2: {
      title:    'Listening Deeper',
      teaser:   'Listen to understand, not to respond.',
      insight:  'Studies show the average leader listens for just 17 seconds before redirecting the conversation. This is not rudeness; it is how brains work. The prefrontal cortex generates a response almost immediately, and once it does, we stop fully absorbing what is being said. David Rock\'s SCARF research explains why this matters beyond information: when a leader genuinely listens without redirecting, they signal safety across multiple social domains — the other person\'s status is honoured, their autonomy is respected, and they feel in-group rather than out-group with their leader. The quality of listening is one of the fastest ways to build or erode relational safety.',
      exercise: 'In your next significant conversation, set yourself this challenge:\n\nDo not speak until the other person has completely finished AND you have waited 3 full seconds of silence.\n\nDuring those 3 seconds, ask yourself: "What is this person most trying to be understood about? What is underneath what they are saying?"\n\nThen respond to that, not to the surface content.\n\nAfterwards, write down:\n- What did you hear that you might have missed if you had responded sooner?\n- What question could you have asked to go deeper?\n- How did the quality of the conversation change?\n\nThe 3-second rule feels awkward at first. That discomfort is the work.',
    },
    3: {
      title:    'The Appreciation Effect',
      teaser:   'Recognition is the most underused leadership tool.',
      insight:  'Gallup research shows that employees who receive specific, genuine recognition from their leader at least once a week are 5 times less likely to leave and 4 times more likely to be highly engaged. John Gottman\'s relationship research found that thriving relationships require a minimum ratio of five positive interactions to every one negative — and that this ratio predicts relationship health more reliably than the absence of conflict. Most leaders invert this: they notice problems more readily than progress, which means their teams experience a net negative relational environment even when no one is being deliberately critical. Specific recognition is the simplest way to rebalance the ratio.',
      exercise: 'Identify 3 people who have done something worth recognising in the last 2 weeks. These do not have to be major achievements; consistent good work, a thoughtful contribution, or getting something done under pressure all count.\n\nFor each person, write a specific message using this structure:\n"I noticed [specific thing they did]. It mattered because [concrete reason it helped]. Thank you."\n\nAvoid vague praise: "great job" lands weakly and is forgotten. "I noticed you stayed across the client issue last Thursday and kept everyone calm — it meant we didn\'t lose the relationship" lands and is remembered.\n\nSend all three messages today.',
    },
    4: {
      title:    'Bridge the Distance',
      teaser:   'Close the gap that hierarchy quietly creates.',
      insight:  'Research on psychological distance shows that as seniority increases, leaders become systematically less aware of their team\'s day-to-day reality. Information is filtered upward, people manage impressions, and leaders gradually lose their grip on what is actually happening. David Rock\'s SCARF research identifies why this gap forms: as leaders become more senior, people increasingly perceive a status differential that triggers a mild threat response — making them less likely to share bad news, push back, or show uncertainty. The leader who actively closes the distance — showing up with curiosity rather than authority, asking rather than telling — shifts people from out-group to in-group, which is the precondition for honest information flowing upward.',
      exercise: 'Have one unscheduled, informal conversation with someone on your team today. Not about tasks or deliverables — about them and how they are finding things.\n\nUse one of these questions to open it:\n"What\'s getting in your way right now that I might be able to help with?"\n"If you could change one thing about how we work, what would it be?"\n"What\'s something you\'ve been wanting to say but haven\'t had the right moment?"\n\nWhen they answer: listen without defending, fixing, or explaining.\n\nAfterwards, write down the most important thing you heard. What does it tell you about what is actually happening that you might not have seen from where you sit?',
    },
  },

  // ── 7: Adaptive resilience (was 6) ───────────────────────────────────────
  7: {
    1: {
      title:    'The Bounce-Back Blueprint',
      teaser:   'Build your recovery plan before you need it.',
      insight:  'Research by Martin Seligman shows that resilience is not a trait; it is a practice. Resilient leaders do not experience fewer setbacks; they have shorter recovery times. The key variable is explanatory style: leaders who see setbacks as temporary and specific recover faster than those who see them as permanent and pervasive.',
      exercise: 'Think of a recent setback or disappointment, something that knocked you or is still sitting with you.\n\nAnalyse it using the 3P framework:\n\n1. Permanent or Temporary? Is this "this always happens to me" or "this happened this time"?\n2. Pervasive or Specific? Is "everything is affected" or "this one area is affected"?\n3. Personal or Contextual? Is "I am the problem" entirely accurate, or do external factors genuinely contribute?\n\nWrite the more accurate, specific version of the story using the second option in each pair.\n\nFor example: "I failed the presentation" becomes "This presentation did not land the way I wanted. I know what I would do differently, and the next one will be better."\n\nAccuracy, not positivity, is what builds resilience.',
    },
    2: {
      title:    'Reframe the Setback',
      teaser:   'Find the data in the difficulty.',
      insight:  'Carol Dweck\'s growth mindset research shows that leaders who view challenges as information rather than verdicts outperform their peers over time. The distinguishing question is not "why did this happen to me?" but "what can I learn from this?" This is not toxic positivity; it is strategic information extraction from experience.',
      exercise: 'Choose one current challenge or recent setback you have not fully processed. Something that still has a charge to it.\n\nWork through these 5 questions in writing:\n1. What specifically went wrong? (Facts only, not the story.)\n2. What did I contribute to this? (Honest, not self-punishing.)\n3. What did I learn that I did not know before?\n4. What would I do differently if this situation arose again?\n5. What unexpected strength or capability did I discover in dealing with it?\n\nNotice how your relationship to the setback shifts as you answer each question. By question 5, most people find the story has changed. That shift is growth mindset in action.',
    },
    3: {
      title:    'The Uncertainty Edge',
      teaser:   'Get comfortable with what you cannot control.',
      insight:  'A study of senior executives found that tolerance for ambiguity is the single strongest predictor of effective leadership in complex, fast-moving organisations: stronger than IQ or technical skill. Yet most leadership development focuses on clarity and decisiveness, not on the ability to hold uncertainty without it destabilising performance.',
      exercise: 'Write down the 3 things causing you the most anxiety or uncertainty right now. Be specific.\n\nFor each one, draw two columns:\nWhat I can influence or control | What I cannot control\n\nPopulate both columns honestly.\n\nNow:\n1. For each "can control" column: circle one item and commit to a specific action on it today\n2. For each "cannot control" column: write this sentence: "I choose to hold this uncertainty without forcing a resolution right now."\n\nThe goal is not to feel better about uncertainty. It is to direct your energy precisely, spending it only where it can actually make a difference.',
    },
    4: {
      title:    'Strength Under Pressure',
      teaser:   'Know exactly who you are when it gets hard.',
      insight:  'Research on post-traumatic growth shows that the key variable in resilience is narrative: the story people tell about who they became through difficulty. Leaders who can articulate how past challenges shaped their capabilities are significantly more likely to perform effectively in future high-pressure situations.',
      exercise: 'Think of the hardest professional challenge you have faced. Not the most recent, but the one that tested you most.\n\nAnswer these questions in writing:\n1. What was the situation? (Keep it brief — 2–3 sentences.)\n2. What did you have to draw on or develop to get through it?\n3. What quality or capability do you have now that you did not have before?\n4. How is that strength available to you today, in your current role?\n5. What would you tell a younger leader facing the same situation?\n\nThis is your resilience story. It is not just a memory; it is evidence of who you are under pressure. Knowing it clearly means you can access it when the next hard thing arrives.',
    },
  },
}

export function getDimOrder(scores: (number | null)[]): number[] {
  return scores
    .map((s, i) => ({ s: s ?? 999, id: i + 1 }))
    .sort((a, b) => a.s - b.s)
    .map(d => d.id)
}

// ── 34-card sequence helpers ─────────────────────────────────────────────────
// 7 dimensions × 4 cards = 28 MQ cards
// Values cards at positions 5, 10, 15, 20, 25, 30 (6 cards)
// Total: 28 MQ + 6 values = 34 cards (with values), 28 without

export const VALUES_CARD_POSITIONS = new Set([5, 10, 15, 20, 25, 30])
export const TOTAL_CARDS_BASE = 28        // MQ cards only
export const TOTAL_CARDS_WITH_VALUES = 34 // MQ + 6 values cards

export function isValuesCard(cardNumber: number): boolean {
  return VALUES_CARD_POSITIONS.has(cardNumber)
}

// Which values slot (0-based) does this card represent? (only valid for values cards)
export function getValuesSlotIndex(cardNumber: number): number {
  return cardNumber / 5 - 1
}

// MQ-only position (1-28) for a non-values card in the 34-card arc
function getMQIndex(cardNumber: number): number {
  return cardNumber - Math.floor(cardNumber / 5)
}

export function getDimForCard(cardNumber: number, dimOrder: number[]): number {
  const mqIndex = getMQIndex(cardNumber)
  return dimOrder[Math.floor((mqIndex - 1) / 4)]
}

export function getCardVariant(cardNumber: number): number {
  const mqIndex = getMQIndex(cardNumber)
  return ((mqIndex - 1) % 4) + 1
}
