'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import MicButton from '@/components/MicButton'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Session {
  id:            string
  title:         string
  created_at:    string
  updated_at:    string
  message_count: number
}

interface Message {
  id?:      string
  role:     'user' | 'assistant'
  content:  string
  pending?: boolean
}

interface MQBuilderProps {
  token:          string
  firstName:      string
  onClose:        () => void
  dimScores?:     (number | null)[]
  prevDimScores?: (number | null)[]
  initialDimId?:  number
}

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    id: 1, name: 'Self-awareness', color: '#fdcb5e', bg: '#FEF5D9',
    tagline: 'The ability to see yourself clearly in real time.',
    what: 'Self-awareness is the capacity to notice your own thoughts, feelings, assumptions and behavioural patterns as they arise — without being swept along by them. It\'s the internal observer that watches how you\'re showing up.',
    high: 'You have a strong internal observer. You catch your own triggers before they escalate and tend to seek honest feedback rather than avoid it.',
    low: 'You may find yourself reacting before choosing your response, or discovering your impact on others after the fact rather than in the moment.',
    science: 'Tasha Eurich\'s research found that while 95% of people believe they are self-aware, only 10–15% actually are. Goleman\'s emotional intelligence work identifies self-awareness as the foundational pillar on which all other leadership capacities rest — you cannot regulate what you cannot see. Neuroscientifically, genuine self-awareness requires active integration between the prefrontal cortex and the brain\'s Default Mode Network. Daniel Siegel calls this capacity "mindsight" — the brain\'s ability to observe its own activity as it happens.',
  },
  {
    id: 2, name: 'Ego & identity', color: '#EC4899', bg: '#FCE7F3',
    tagline: 'Leading from strength, not from the need for approval.',
    what: 'Ego & identity describes the degree to which your leadership is driven by genuine values versus the unconscious need to protect your image, status, or sense of self. It\'s the difference between leading from strength and leading from fear of looking bad.',
    high: 'You can receive feedback without becoming defensive, admit mistakes without it threatening your identity, and share credit without feeling diminished.',
    low: 'You may notice a pull towards protecting your image — perhaps avoiding feedback, over-explaining mistakes, or becoming defensive when challenged.',
    science: 'Kegan and Lahey\'s research on "Immunity to Change" found that most leadership development failures are caused by hidden commitments to protecting self-image, not lack of skill. Neuroscience confirms that social threat activates the same fight-or-flight response as physical danger — shutting down the very capacities leaders need most. Brené Brown\'s research connects this to vulnerability: leaders who can\'t tolerate being wrong consistently create cultures of self-protection around them.',
  },
  {
    id: 3, name: 'Emotional regulation', color: '#ff7b7a', bg: '#FFE8E8',
    tagline: 'Letting emotions inform you rather than run you.',
    what: 'Emotional regulation is the ability to manage your emotional responses — especially under pressure — so they serve your goals rather than derail them. This isn\'t about suppressing emotion; it\'s about processing it so you can respond wisely.',
    high: 'You stay grounded under pressure. Others likely experience you as steady and safe to bring problems to.',
    low: 'Emotional intensity may sometimes hijack your thinking or limit your presence in high-stakes moments.',
    science: 'Amy Arnsten\'s research shows that even moderate stress takes the prefrontal cortex offline, reducing your capacity for clear thinking and sound judgment. Joseph LeDoux documented how the amygdala can hijack the whole system in milliseconds. Viktor Frankl captured the core insight: between stimulus and response there is a space — and that space is what emotional regulation lets you access.',
  },
  {
    id: 4, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0',
    tagline: 'The capacity to think in multiple directions at once.',
    what: 'Cognitive flexibility is the ability to hold several perspectives simultaneously, update your thinking when new information arrives, and move between different mental models. It\'s the opposite of rigid, either/or thinking.',
    high: 'You readily update your mental models, entertain contradictory ideas, and are seen by others as open-minded and intellectually curious.',
    low: 'You may default to familiar frameworks even when the situation calls for fresh thinking, or find it uncomfortable when others challenge your interpretation.',
    science: 'Carol Dweck\'s growth mindset research shows that believing capabilities are developable is one of the strongest predictors of learning and leadership effectiveness. Kahneman\'s work on System 1 and System 2 thinking reveals how much decision-making is governed by fast, automatic, pattern-based thinking. Neuroscience adds a critical insight: cognitive flexibility depends directly on prefrontal cortex function — the same system that goes offline under stress — which is why we default to rigid thinking precisely when we most need fresh perspectives.',
  },
  {
    id: 5, name: 'Values & purpose', color: '#00c9a7', bg: '#D4F5EF',
    tagline: "Knowing what you stand for — and where you're going.",
    what: 'Values & purpose is about knowing what you genuinely believe in and having a clear sense of direction that motivates your leadership beyond personal gain. It\'s the alignment between your stated principles, your lived behaviour, and your sense of meaningful contribution.',
    high: 'Your decisions are anchored by a clear internal compass. Others experience you as consistent and trustworthy — they know what you stand for because your behaviour demonstrates it.',
    low: 'You may hold values you believe in but haven\'t fully translated into consistent, visible behaviour. The gap between intention and action may be wider than you\'d like.',
    science: 'Viktor Frankl established that meaning and purpose are primary human motivators — and that clarity of purpose is what sustains people through adversity. Self-determination theory (Deci and Ryan) identifies values alignment as a core driver of intrinsic motivation. Brené Brown\'s research shows that values-driven leaders — who act from what they stand for rather than fear of judgment — consistently build higher-trust, higher-performance cultures.',
  },
  {
    id: 6, name: 'Relational mindset', color: '#2d4a8a', bg: '#E0E6F5',
    tagline: 'The quality of presence you bring to every interaction.',
    what: 'Relational mindset describes the intention and quality of attention you bring to your relationships — whether you genuinely seek to understand others, or primarily see people through the lens of what they can do for you.',
    high: 'You approach relationships with genuine curiosity and care. People feel seen and heard by you, which builds loyalty and creates conditions where others do their best work.',
    low: 'Under pressure, you may shift into transactional mode, treating relationships as means to an end, or giving people less real attention than they need to feel genuinely valued.',
    science: 'Amy Edmondson\'s Harvard research identified psychological safety as the single biggest determinant of team effectiveness. Daniel Siegel\'s interpersonal neurobiology shows that genuine attunement has measurable neurological effects — reducing the threat response in those being led. Mirror neuron research confirms that a leader\'s internal emotional state is literally contagious, spreading through a team below the level of conscious awareness.',
  },
  {
    id: 7, name: 'Adaptive resilience', color: '#a78bfa', bg: '#EDE9FE',
    tagline: 'Bouncing forward, not just back.',
    what: 'Adaptive resilience is the ability to sustain performance under sustained pressure, recover from setbacks, and find meaning in adversity rather than being destabilised by it. It\'s not toughness — it\'s flexibility under load.',
    high: 'You have strong internal resources for navigating difficulty. Setbacks tend to become learning rather than defeat, and you likely recover your equilibrium faster than most.',
    low: 'Sustained pressure may be depleting your capacity in ways that affect your thinking, relationships, and decision-making. Rest and recovery may not be getting the attention they need.',
    science: 'Richard Davidson\'s neuroscience research confirms that the brain\'s capacity for regulation and recovery is genuinely plastic — it can be strengthened through deliberate practice. Martin Seligman\'s learned optimism research shows that how people explain adversity to themselves is highly predictive of long-term resilience. Ann Masten reframes resilience as "ordinary magic" — not a rare quality, but a set of everyday capacities that can be deliberately built.',
  },
]

// ── Deep-dive research data ────────────────────────────────────────────────────

interface DeepDiveSlide {
  researcher: string
  work:       string
  tagline:    string
  points:     string[]
}

const DEEP_DIVE_DATA: Record<number, DeepDiveSlide[]> = {
  1: [
    {
      researcher: 'Tasha Eurich',
      work:       'Insight (2017)',
      tagline:    'The self-awareness gap is bigger than anyone realises.',
      points: [
        '95% of people believe they are self-aware — only 10–15% actually meet the criteria.',
        'There are two distinct types: internal self-awareness (knowing your own values, thoughts, emotions) and external self-awareness (knowing how others see you). Leaders rarely excel at both.',
        'High introspection doesn\'t equal high self-awareness. Asking "why" you feel a certain way often increases rumination without insight. Asking "what" — what can I do differently? — produces more useful results.',
        'Power erodes self-awareness over time: the more senior a leader, the fewer honest signals they receive. Building deliberate feedback loops is essential.',
      ],
    },
    {
      researcher: 'Daniel Goleman',
      work:       'Emotional Intelligence (1995)',
      tagline:    'Self-awareness is the master switch of effective leadership.',
      points: [
        'Self-awareness is the foundational pillar of emotional intelligence — without it, the other competencies (regulation, empathy, social skill) cannot function well.',
        'Goleman\'s analysis of nearly 200 large, global companies found that emotional intelligence, anchored by self-awareness, was twice as important as technical or cognitive skills for senior leadership performance.',
        'Leaders with low self-awareness have blind spots that ripple through their teams — creating cultures that mirror their unexamined patterns.',
        'The good news: self-awareness is trainable. Leaders who invest in it show measurable improvements in decision quality, team trust, and resilience under pressure.',
      ],
    },
    {
      researcher: 'Daniel Siegel',
      work:       'Mindsight: The New Science of Personal Transformation (2010)',
      tagline:    'The brain can observe itself — and that changes everything.',
      points: [
        'Siegel coined "mindsight" to describe the brain\'s capacity to perceive its own activity as it unfolds — a kind of internal sight that goes beyond ordinary introspection.',
        'This capacity depends on integration between the prefrontal cortex and deeper limbic regions. When these systems communicate well, you can notice an emotion arising without being swept away by it.',
        'Mindsight is trainable through reflective practices that create new neural pathways — literally reshaping how the brain processes experience.',
        'For leaders, developing mindsight means the gap between stimulus and response widens. You start to catch patterns before they become problems.',
      ],
    },
  ],
  2: [
    {
      researcher: 'Robert Kegan & Lisa Lahey',
      work:       'Immunity to Change (2009)',
      tagline:    'Most leadership development fails because the real obstacle is hidden.',
      points: [
        'Kegan and Lahey found that people reliably sabotage their own stated change goals — not from lack of will or skill, but because they hold unconscious "competing commitments" that conflict with change.',
        'The most common hidden commitment is: I must protect my image, status, and sense of competence at all costs. This is often the invisible force stopping leaders from seeking feedback, admitting mistakes, or delegating.',
        'Their "Immunity to Change" map reveals the "big assumption" beneath these hidden commitments — usually something like: "If I appear uncertain, people will lose confidence in me."',
        'The process isn\'t about willpower — it\'s about making the hidden visible, then running small experiments to test whether the big assumption is actually true.',
      ],
    },
    {
      researcher: 'David Rock',
      work:       'Your Brain at Work (2009) / SCARF Model',
      tagline:    'Social threats hit the brain exactly like physical danger.',
      points: [
        'Rock\'s SCARF model identifies five social domains that trigger threat or reward responses: Status, Certainty, Autonomy, Relatedness, and Fairness.',
        'A threat to status — being corrected, overlooked, or publicly wrong — activates the same neural fight-or-flight cascade as a physical threat, shutting down the PFC.',
        'This means leaders become least capable of clear thinking precisely when their ego is most challenged. Defensiveness is a neurological reflex, not a character flaw.',
        'Understanding SCARF allows leaders to redesign conversations, feedback processes, and team interactions to minimise unnecessary threat activation.',
      ],
    },
    {
      researcher: 'Brené Brown',
      work:       'Dare to Lead (2018)',
      tagline:    'The armoured leader protects ego at the cost of everything that matters.',
      points: [
        'Brown\'s decade of research found a direct link between ego-protection ("armoured leadership") and cultures of self-protection — where people hide mistakes, avoid risk, and disengage.',
        '"Daring leadership" requires the willingness to be wrong, uncertain, and imperfect — not as weakness, but as the foundation of genuine trust and connection.',
        'Leaders who can\'t tolerate being perceived as incompetent consistently create the very cultures of incompetence they fear — because their teams stop bringing them real problems.',
        'Shame resilience (the ability to recognize shame and move through it without it controlling behaviour) is the key inner skill that separates armoured from daring leaders.',
      ],
    },
    {
      researcher: 'Carl Jung & Robert Hogan',
      work:       'The Shadow (1930s) / Hogan Development Survey',
      tagline:    'Your greatest leadership liabilities are often your greatest strengths — overused.',
      points: [
        'Jung identified the "shadow" as the unconscious part of the self that the ego refuses to acknowledge — traits we repress because they feel threatening to our self-image. In leaders, the shadow often contains insecurity, fear of failure, aggression, or the desperate need to be liked. We don\'t get rid of these; we just stop seeing them.',
        'Shadow behaviours emerge most visibly under pressure — when the managed, conscious self gives way to unexamined patterns. This is why leaders who appear exemplary in stable conditions can derail badly in crisis: the shadow runs the show when the ego is stretched.',
        'Robert Hogan\'s research operationalised this for leadership through the Hogan Development Survey — identifying 11 measurable derailer patterns (such as Bold, Excitable, Sceptical, Cautious, Mischievous). Each one is a genuine strength at normal expression that becomes a liability when overused under stress. Boldness becomes arrogance. Caution becomes paralysis. Scepticism becomes cynicism.',
        'The shadow cannot be eliminated — only made conscious. Leaders who do this work don\'t become shadow-free; they develop the capacity to notice their shadow patterns arising and catch them before they cause damage. That awareness is the work.',
      ],
    },
    {
      researcher: 'Pauline Clance & Suzanne Imes',
      work:       'The Imposter Phenomenon (1978)',
      tagline:    'High achievers are often the least convinced they deserve to be there.',
      points: [
        'Clance and Imes coined "imposter phenomenon" to describe the persistent internal experience of feeling like a fraud despite clear external evidence of competence — and the chronic fear that at some point, people will find you out.',
        'It is most prevalent among high achievers, not underperformers. The more genuinely capable you are, the more aware you become of how much you don\'t know — which the imposter mind reads as evidence of inadequacy rather than the natural condition of expertise.',
        'Imposter syndrome is an ego-protection pattern in disguise. It typically drives overwork, perfectionism, difficulty delegating, and reluctance to ask for help — behaviours that look like diligence from the outside but are rooted in fear of exposure from the inside.',
        'The research-backed shift is not building confidence through positive self-talk — it\'s internalisation: developing an accurate, evidence-based internal account of your own competence. This requires deliberately sitting with what you have actually done, built, and navigated, rather than immediately discounting it.',
      ],
    },
  ],
  3: [
    {
      researcher: 'Amy Arnsten',
      work:       'Stress Signalling Pathways Research, Yale (2009)',
      tagline:    'Even mild stress takes the thinking brain offline.',
      points: [
        'Arnsten\'s lab showed that even mild, uncontrollable stress causes a rapid and dramatic loss of prefrontal cognitive function — the part of the brain responsible for sound judgement, clear thinking, and impulse control.',
        'Under stress, high levels of norepinephrine and dopamine "switch" the brain from reflective to reflexive mode — the amygdala takes over while the PFC stands down.',
        'This neural shift is evolutionary: it prioritises fast survival responses over nuanced analysis. Useful in physical emergencies; deeply counterproductive in leadership conversations.',
        'The key word is "uncontrollable" — stress you feel you can manage has a much milder effect. Regulation practices that restore a sense of agency physically protect PFC function.',
      ],
    },
    {
      researcher: 'Joseph LeDoux',
      work:       'The Emotional Brain (1996)',
      tagline:    'The amygdala fires before you are conscious of what triggered it.',
      points: [
        'LeDoux mapped the brain\'s "low road" — a fast neural pathway from thalamus directly to the amygdala that bypasses conscious processing and can trigger a full stress response before you know why.',
        'This means emotional reactions can be fully underway before your conscious mind has assessed the situation — which is why "just stay calm" is neurologically impractical without training.',
        'The amygdala doesn\'t distinguish between real threats and social or symbolic ones — being publicly criticised activates the same cascade as physical danger.',
        'LeDoux\'s work explains why emotional regulation must be practised when calm: you\'re building neural pathways (PFC-amygdala connections) that can interrupt the "low road" response before it escalates.',
      ],
    },
    {
      researcher: 'Viktor Frankl',
      work:       "Man's Search for Meaning (1946)",
      tagline:    'Between stimulus and response is a space — and that space is everything.',
      points: [
        'Frankl\'s observations from Auschwitz led to a profound insight: those who survived psychologically intact were not those who felt no distress, but those who maintained the inner freedom to choose their response.',
        '"Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom."',
        'Emotional regulation, in Frankl\'s framework, isn\'t suppression — it\'s the cultivation of that space through meaning, values, and conscious attention.',
        'Leaders who have a clear sense of purpose have a wider space between stimulus and response. Purpose is not just motivational — it is neurologically protective under adversity.',
      ],
    },
  ],
  4: [
    {
      researcher: 'Carol Dweck',
      work:       'Mindset: The New Psychology of Success (2006)',
      tagline:    'What you believe about your abilities determines more than your abilities do.',
      points: [
        'Dweck\'s decades of research established two fundamental mindsets: fixed (abilities are innate and static) and growth (abilities can be developed through effort and learning).',
        'People with a fixed mindset avoid challenges that might reveal inadequacy, ignore feedback that doesn\'t confirm their self-concept, and experience the success of others as a threat.',
        'Leaders with a growth mindset are significantly more likely to seek honest feedback, take calculated risks, and build psychologically safe team cultures — because failure becomes information, not identity.',
        'Crucially, mindset is not fixed. Targeted interventions — even brief — can shift people from fixed to growth orientation, and the performance gains are measurable.',
      ],
    },
    {
      researcher: 'Daniel Kahneman',
      work:       'Thinking, Fast and Slow (2011)',
      tagline:    'We think we\'re reasoning. Often, we\'re just rationalising.',
      points: [
        'Kahneman identifies two modes of thinking: System 1 (fast, automatic, intuitive, pattern-based — runs 95% of the time) and System 2 (slow, deliberate, effortful, analytical).',
        'Most leadership decisions are made by System 1 — which means they\'re heavily influenced by cognitive biases: confirmation bias, anchoring, the availability heuristic, and status quo bias.',
        'Under pressure or time constraints, System 2 gives up even faster — leaving System 1 (and its biases) entirely in charge. This is when leaders are most cognitively rigid.',
        'Cognitive flexibility is the skill of recognising when System 1 is operating and deliberately engaging System 2 to check its conclusions — particularly in high-stakes, novel situations.',
      ],
    },
    {
      researcher: 'Neuroscience of Cognitive Flexibility',
      work:       'Prefrontal Cortex Research (ongoing)',
      tagline:    'Flexibility lives in the part of the brain most vulnerable to stress.',
      points: [
        'Cognitive flexibility — the ability to shift between mental frameworks, update beliefs, and hold multiple perspectives — is primarily governed by the prefrontal cortex (PFC).',
        'The PFC is also the system most degraded by stress, sleep deprivation, and ego threat — which is why we default to rigid, familiar thinking precisely when we most need fresh perspectives.',
        'Cognitive flexibility correlates strongly with working memory capacity: the more "space" available in working memory, the more information a leader can hold simultaneously when making decisions.',
        'Regular practices that protect PFC function — adequate sleep, physical exercise, deliberate recovery, and mindfulness — are not "wellness" activities. They are cognitive performance strategies.',
      ],
    },
    {
      researcher: 'Aaron Beck & Albert Ellis',
      work:       'Cognitive Therapy (1960s) / Rational Emotive Behaviour Therapy (1955)',
      tagline:    'The most rigid thing in a leader\'s mind is often something they\'ve never questioned.',
      points: [
        'Aaron Beck identified "core beliefs" — deep, global, absolute assumptions about self, others, and the world that form early in life and operate as invisible filters on everything we perceive. In leaders, these commonly include: "I must be competent at everything," "Showing uncertainty is weakness," "If I need help, I\'m not leadership material."',
        'Albert Ellis independently identified what he called "irrational beliefs" — rigid, inflexible rules disguised as reasonable preferences. His ABC model demonstrated that it\'s not events that drive our emotional and behavioural responses, but the beliefs we hold about those events. Two leaders can face the same setback with entirely different outcomes based purely on their underlying belief structure.',
        'Limiting beliefs don\'t feel like beliefs — they feel like facts. This is what makes them so difficult to shift: they operate below the level of conscious examination, shaping what we notice, what we ignore, and what conclusions we allow ourselves to reach. Cognitive flexibility is precisely the capacity to surface these invisible assumptions and treat them as testable rather than settled.',
        'The research-backed intervention is not positive thinking — it\'s belief testing. Taking a limiting belief ("I\'m not strategic enough", "I\'m not a natural people person") and treating it as a hypothesis rather than a truth. What is the actual evidence for it? What evidence contradicts it? What would a genuinely curious, open-minded observer conclude? That inquiry is the move.',
      ],
    },
  ],
  5: [
    {
      researcher: 'Viktor Frankl',
      work:       "Man's Search for Meaning (1946) / Logotherapy",
      tagline:    'The primary human drive is not pleasure or power — it is meaning.',
      points: [
        'Frankl\'s logotherapy established that the will to meaning is the primary human motivator — not Freud\'s will to pleasure or Adler\'s will to power.',
        'In Auschwitz, Frankl observed that those with a clear reason to survive — a person to return to, a work to complete — maintained psychological functioning and survived at higher rates than those without.',
        '"He who has a why to live for can bear almost any how." For leaders, this translates: clarity of purpose is what sustains performance through sustained adversity.',
        'Frankl distinguished between a life that asks "what can I get from this?" and one that asks "what does this situation ask of me?" — the latter is values-driven leadership in its purest form.',
      ],
    },
    {
      researcher: 'Edward Deci & Richard Ryan',
      work:       'Self-Determination Theory (1985–present)',
      tagline:    'Values alignment is the engine of intrinsic motivation.',
      points: [
        'SDT identifies three innate psychological needs whose satisfaction predicts intrinsic motivation: autonomy (ownership over actions), competence (mastery and growth), and relatedness (genuine connection with others).',
        'The theory maps a spectrum from external regulation (doing things for rewards/fear) through introjection (doing it to avoid guilt) to identified regulation (doing it because it aligns with personal values). Only identified regulation sustains high-quality, persistent effort.',
        'Leaders who help people connect their daily work to genuine values — not just company values — activate the highest quality motivation. Extrinsic rewards, overused, actually undermine intrinsic motivation over time.',
        'The key leadership implication: why people are doing something matters as much as whether they are doing it. Performance driven by fear or reward is fragile. Performance driven by values is durable.',
      ],
    },
    {
      researcher: 'Brené Brown',
      work:       'Dare to Lead (2018)',
      tagline:    'Values that aren\'t behavioural are just beliefs.',
      points: [
        'Brown\'s research found that most leaders have not clearly identified their two core operating values — the principles that actually drive their behaviour under pressure, as distinct from their aspirational values.',
        'Values that are not translated into specific, observable behaviours are invisible to the people being led. Culture is not built by values posters — it is built by what leaders model and what they tolerate.',
        'Values-driven leaders make decisions faster and recover from setbacks more quickly — because their internal compass removes the need to relitigate first principles every time.',
        'The hardest test of values is not when it\'s comfortable to live by them — it\'s when choosing courage over comfort means accepting real cost. That\'s when values either lead or reveal themselves as aspiration.',
      ],
    },
  ],
  6: [
    {
      researcher: 'Amy Edmondson',
      work:       'Psychological Safety and Learning Behavior in Work Teams (1999) / The Fearless Organization (2018)',
      tagline:    'Teams that feel safe to fail are the ones that succeed.',
      points: [
        'Edmondson first defined psychological safety as "a shared belief held by members of a team that the team is safe for interpersonal risk-taking." Originally coined in 1965 by Schein and Bennis, Edmondson operationalised it for organisational research.',
        'Her counterintuitive hospital finding: high-performing medical teams reported more errors than low-performing ones — not because they made more mistakes, but because psychological safety made it safe to report them. The same pattern holds across all industries.',
        'Google\'s Project Aristotle studied 180 teams over two years and found psychological safety was the single most important factor in team effectiveness — outweighing talent, structure, and management quality.',
        'Leaders create or destroy psychological safety through their own micro-behaviours: how they respond to questions, whether they admit uncertainty, how they react to bad news. The relational climate is set from the top, in real time.',
      ],
    },
    {
      researcher: 'Daniel Siegel',
      work:       'Interpersonal Neurobiology / The Developing Mind (1999)',
      tagline:    'Your inner state is contagious — your team\'s nervous system is tuned to yours.',
      points: [
        'Siegel\'s interpersonal neurobiology demonstrates that human nervous systems co-regulate — when a leader is genuinely calm and present, those around them experience measurable physiological calming.',
        'This "attunement" — being genuinely attuned to another\'s state — reduces the threat response in the person being led, creating the conditions for better thinking, risk-taking, and honest communication.',
        'Presence is not just a soft quality — it is a neurological signal. When leaders are distracted, checked-out, or internally activated, their teams\' nervous systems respond to this signal, often without conscious awareness.',
        'The quality of attention a leader brings to a conversation is literally shaping the neurological experience of the person they\'re with. Genuine curiosity and interest have measurable effects on the other person\'s brain.',
      ],
    },
    {
      researcher: 'Mirror Neuron Research',
      work:       'Rizzolatti et al., Parma (1990s) / Social Neuroscience',
      tagline:    'We are neurologically wired to catch each other\'s emotional states.',
      points: [
        'Mirror neurons, discovered accidentally in Rizzolatti\'s Parma lab, fire both when we perform an action and when we observe another performing it — providing the neural basis for empathy and emotional contagion.',
        'A leader\'s emotional state is not just communicated through words and body language — it is neurologically "caught" by team members below the level of conscious awareness.',
        'Emotional contagion flows most powerfully downward in hierarchies — meaning the leader\'s state has disproportionate impact on team mood, engagement, and cognitive capacity.',
        'This makes a leader\'s inner life — not just their outward behaviour — a strategic variable. You cannot perform calm and expect your team to experience calm. The regulation has to be genuine.',
      ],
    },
  ],
  7: [
    {
      researcher: 'Richard Davidson',
      work:       'The Emotional Life of Your Brain (2012) / Center for Healthy Minds Research',
      tagline:    'Resilience is not a trait — it is a trainable brain circuit.',
      points: [
        'Davidson\'s neuroscience research at Wisconsin established that the brain\'s capacity for resilience — specifically the speed and completeness of recovery from adversity — varies enormously between individuals and is directly tied to specific neural circuits.',
        'Crucially, these circuits are plastic: they respond to deliberate practice. Just 30 minutes per day for two weeks of mindfulness training produces measurable changes in the brain circuits governing emotional recovery.',
        'Davidson defines resilience specifically as recovery speed — how quickly the brain returns to baseline after a stressor. High resilience does not mean not being affected; it means recovering faster.',
        'Well-being is a skill. Davidson\'s framework positions resilience alongside four other trainable dimensions: outlook, attention, generosity, and purpose — all of which can be deliberately strengthened.',
      ],
    },
    {
      researcher: 'Martin Seligman',
      work:       'Learned Optimism (1991) / Flourish (2011)',
      tagline:    'How you explain setbacks to yourself predicts your future performance.',
      points: [
        'Seligman identified "explanatory style" — the habitual way we explain why bad things happen — as a powerful predictor of resilience, health, and performance under adversity.',
        'A pessimistic explanatory style treats setbacks as permanent ("this will always be true"), pervasive ("this affects everything"), and personal ("it\'s because of who I am"). This depletes motivation and predicts helplessness.',
        'An optimistic style treats setbacks as temporary, specific, and situational — preserving energy, motivation, and the belief that effort makes a difference. Insurance agents with optimistic styles sold 37% more and quit half as often.',
        'Crucially, Seligman showed that explanatory style can be learned and changed through targeted cognitive practices — it is not a fixed personality trait. He called this "learned optimism."',
      ],
    },
    {
      researcher: 'Ann Masten',
      work:       'Ordinary Magic: Resilience in Development (2014)',
      tagline:    'Resilience is not rare — it is built from everyday human capacities.',
      points: [
        'Masten coined the term "ordinary magic" to describe resilience — arguing powerfully against the idea that it is a special quality found only in exceptional people.',
        'Her research shows that resilience emerges from ordinary human resources: close relationships, a sense of meaning, the ability to regulate emotions, and connection to community.',
        'The most powerful single predictor of resilience under adversity is the quality of at least one close, supportive relationship. For leaders, this has direct implications for how they show up for the people they lead.',
        'Post-traumatic growth — not just recovery but genuine development through adversity — is common when people have adequate support, meaning, and the capacity to process experience. Leaders who normalise resilience make it possible for their teams.',
      ],
    },
  ],
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getScoreBandLabel(score: number): string {
  if (score >= 90) return 'Exceptional'
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Solid'
  if (score >= 40) return 'Developing'
  return 'Growth area'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MQBuilder({ token, firstName, onClose, dimScores, prevDimScores, initialDimId }: MQBuilderProps) {
  const [view,           setView]           = useState<'home' | 'overview' | 'chat'>(initialDimId ? 'overview' : 'home')
  const [selectedDimId,  setSelectedDimId]  = useState<number | null>(initialDimId ?? null)
  const [sessions,       setSessions]       = useState<Session[]>([])
  const [activeSession,  setActiveSession]  = useState<Session | null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [msgLoaded,      setMsgLoaded]      = useState(false)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const [hoveredDim,     setHoveredDim]     = useState<number | null>(null)
  const [autoStarted,    setAutoStarted]    = useState(false)
  const [showDeepDive,   setShowDeepDive]   = useState(false)
  const [deepDiveSlide,  setDeepDiveSlide]  = useState(0)

  // Lowest-scoring dimension = focus
  const focusDimId: number | null = dimScores
    ? dimScores.map((s, i) => ({ s: s ?? 999, i })).sort((a, b) => a.s - b.s)[0].i + 1
    : null

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // ── Load sessions ───────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/coaching-room?type=mq_builder', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setSessions(d.sessions ?? []) }
    } finally { setSessionsLoaded(true) }
  }, [token])

  useEffect(() => { loadSessions() }, [loadSessions])

  // ── Load messages ───────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (sessionId: string) => {
    setMsgLoaded(false)
    try {
      const res = await fetch(`/api/coaching-room?sessionId=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setMessages(d.messages ?? []) }
    } finally { setMsgLoaded(true) }
  }, [token])

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: msgLoaded ? 'smooth' : 'instant' })
    }
  }, [messages, msgLoaded, view])

  // ── Focus input ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 150)
  }, [view])

  // ── Auto-start: send kick-off message on new sessions ───────────────────────
  useEffect(() => {
    if (
      view === 'chat' &&
      msgLoaded &&
      messages.length === 0 &&
      activeSession &&
      selectedDimId &&
      !autoStarted
    ) {
      setAutoStarted(true)
      const dim = DIMENSIONS[selectedDimId - 1]
      triggerOpeningMessage(activeSession.id, selectedDimId, dim.name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, msgLoaded, messages.length, activeSession, selectedDimId, autoStarted])

  async function triggerOpeningMessage(sessionId: string, dimId: number, dimName: string) {
    const triggerMsg = `Help me build my ${dimName.toLowerCase()}`
    setLoading(true)
    setMessages([{ role: 'assistant', content: '', pending: true }])
    try {
      const res = await fetch('/api/coaching-room', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: triggerMsg, sessionId, focusDimensionId: dimId, hideTrigger: true }),
      })
      const data = await res.json()
      const reply = res.ok && data.reply ? data.reply : 'Something went wrong. Please try again.'
      setMessages([{ role: 'assistant', content: reply }])
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, title: dimName } : s
      ))
      setActiveSession(prev => prev ? { ...prev, title: dimName } : prev)
    } catch {
      setMessages([{ role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // ── Open a past session ──────────────────────────────────────────────────────
  async function openSession(session: Session) {
    setActiveSession(session)
    setMessages([])
    setAutoStarted(true) // don't re-trigger auto-start for existing sessions
    setView('chat')
    await loadMessages(session.id)
  }

  // ── Select dimension and go to overview ─────────────────────────────────────
  function selectDimension(dimId: number) {
    setSelectedDimId(dimId)
    setView('overview')
  }

  // ── Start session from overview ──────────────────────────────────────────────
  async function startSession() {
    const prevSessionId = sessions[0]?.id
    const dimName = selectedDimId ? DIMENSIONS[selectedDimId - 1]?.name : undefined
    const res = await fetch('/api/coaching-room', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ action: 'new_session', prevSessionId, sessionType: 'mq_builder', title: dimName }),
    })
    if (res.ok) {
      const { session } = await res.json()
      if (!session) return
      setActiveSession(session)
      setMessages([])
      setMsgLoaded(true)
      setAutoStarted(false) // will trigger auto-start
      setView('chat')
      setSessions(prev => [session, ...prev])
    }
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim()
    if (!text || loading || !activeSession) return
    setInput('')
    setLoading(true)
    setMessages(prev => [
      ...prev,
      { role: 'user',      content: text, pending: false },
      { role: 'assistant', content: '',   pending: true  },
    ])
    try {
      const res = await fetch('/api/coaching-room', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: text, sessionId: activeSession.id, focusDimensionId: selectedDimId }),
      })
      const data = await res.json()
      const reply = res.ok && data.reply ? data.reply : 'Something went wrong. Please try again.'
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // ── Delete session ───────────────────────────────────────────────────────────
  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(sessionId)
    try {
      await fetch(`/api/coaching-room?sessionId=${sessionId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } finally { setDeletingId(null) }
  }

  // ── Back to home ─────────────────────────────────────────────────────────────
  function backToHome() {
    setView('home')
    setActiveSession(null)
    setMessages([])
    setAutoStarted(false)
    loadSessions()
  }

  // ── Active dim info ──────────────────────────────────────────────────────────
  const activeDim = selectedDimId ? DIMENSIONS[selectedDimId - 1] : null

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── HOME VIEW ───────────────────────────────────────────────────────── */}
      {view === 'home' && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                     style={{ backgroundColor: '#0AF3CD' }}>🧠</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'white' }}>MQ Builder</p>
                  <p className="text-xs" style={{ color: '#B9F8DD' }}>Develop your 7 dimensions</p>
                </div>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-5">

              {/* Intro */}
              <p className="text-sm font-semibold mb-1" style={{ color: '#0A2E2A' }}>
                Which dimension do you want to work on?
              </p>
              {focusDimId ? (
                <p className="text-xs mb-5" style={{ color: '#05A88E' }}>
                  Your focus dimension is highlighted — your lowest score. It's a good place to start.
                </p>
              ) : (
                <p className="text-xs mb-5" style={{ color: '#05A88E' }}>
                  Each session focuses on one dimension with a structured coaching conversation.
                </p>
              )}

              {/* Dimension cards */}
              <div className="grid grid-cols-1 gap-2.5 mb-8">
                {DIMENSIONS.map(dim => {
                  const score     = dimScores?.[dim.id - 1] ?? null
                  const prevScore = prevDimScores?.[dim.id - 1] ?? null
                  const delta     = score !== null && prevScore !== null ? score - prevScore : null
                  const isFocus   = focusDimId === dim.id
                  return (
                    <button
                      key={dim.id}
                      onClick={() => selectDimension(dim.id)}
                      onMouseEnter={() => setHoveredDim(dim.id)}
                      onMouseLeave={() => setHoveredDim(null)}
                      className="w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: isFocus ? dim.bg : hoveredDim === dim.id ? dim.bg : 'white',
                        border: `2px solid ${isFocus ? dim.color : hoveredDim === dim.id ? dim.color + '80' : '#E8F4F0'}`,
                        boxShadow: isFocus ? `0 0 0 1px ${dim.color}30` : 'none',
                      }}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: dim.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>
                            {dim.name}
                          </span>
                          {isFocus && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                                  style={{ backgroundColor: dim.color + '25', color: dim.color }}>
                              focus
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{dim.tagline}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        {delta !== null && delta !== 0 && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: delta > 0 ? '#D1FAE5' : '#FEE2E2',
                                  color:           delta > 0 ? '#065F46' : '#991B1B',
                                  fontSize: '10px',
                                }}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        {score !== null && (
                          <span className="text-sm font-bold" style={{ color: isFocus ? dim.color : '#9CA3AF' }}>
                            {score}
                          </span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke={isFocus ? dim.color : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Past sessions */}
              {sessionsLoaded && sessions.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider pb-3" style={{ color: '#9CA3AF' }}>
                    Past sessions
                  </p>
                  <div className="space-y-2">
                    {sessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => openSession(session)}
                        className="w-full text-left rounded-2xl p-4 flex items-start justify-between gap-3 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 8px rgba(10,46,42,0.06)' }}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                               style={{ backgroundColor: '#0A2E2A' }}>🧠</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#0A2E2A' }}>
                              {session.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                              {formatDate(session.updated_at)}
                              {session.message_count > 0 && ` · ${session.message_count} messages`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          disabled={deletingId === session.id}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-100 opacity-40 transition-opacity mt-0.5"
                          style={{ backgroundColor: '#FEE2E2' }}
                          aria-label="Delete session"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </button>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── OVERVIEW VIEW ───────────────────────────────────────────────────── */}
      {view === 'overview' && activeDim && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={() => setView('home')}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'white' }}>{activeDim.name}</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>MQ Builder</p>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6">

              {/* Dimension header card */}
              <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: activeDim.bg }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeDim.color }} />
                  <p className="text-base font-bold" style={{ color: '#0A2E2A' }}>{activeDim.name}</p>
                  {(() => {
                    const score = dimScores?.[activeDim.id - 1] ?? null
                    if (score === null) return null
                    const label = getScoreBandLabel(score)
                    return (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: activeDim.color }}>{label}</span>
                        <span className="text-lg font-black" style={{ color: activeDim.color }}>{score}</span>
                      </div>
                    )
                  })()}
                </div>
                <p className="text-sm italic mb-0" style={{ color: '#374151' }}>"{activeDim.tagline}"</p>
              </div>

              {/* What it is */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
                  What it is
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{activeDim.what}</p>
              </div>

              {/* Score context */}
              {(() => {
                const score = dimScores?.[activeDim.id - 1] ?? null
                if (score === null) return null
                const isLow  = score < 60
                const text   = isLow ? activeDim.low : activeDim.high
                const label  = isLow ? 'Where you are now' : 'Your current strength'
                const bg     = isLow ? '#FFF7ED' : '#F0FDF4'
                const col    = isLow ? '#D97706' : '#059669'
                return (
                  <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: bg }}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: col }}>{label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{text}</p>
                  </div>
                )
              })()}

              {/* Deep dive button */}
              {DEEP_DIVE_DATA[activeDim.id] && (
                <button
                  onClick={() => { setDeepDiveSlide(0); setShowDeepDive(true) }}
                  className="w-full flex items-center gap-3 rounded-2xl p-4 mb-5 text-left hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: activeDim.bg, border: `1px solid ${activeDim.color}50` }}
                >
                  <span style={{ fontSize: 20 }}>🔬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: activeDim.color }}>
                      Take a deeper dive
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      The science &amp; psychology behind this dimension
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke={activeDim.color} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}

              {/* What to expect */}
              <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7' }}>
                <p className="text-xs font-bold mb-1.5" style={{ color: '#05A88E' }}>What to expect in this session</p>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  Your coach will open with a question about where you are with {activeDim.name.toLowerCase()} right now. From there you'll work through what's actually going on for you, with practical strategies tailored to what you share.
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={startSession}
                className="w-full py-4 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: activeDim.color, color: '#0A2E2A' }}
              >
                Start session — {activeDim.name} →
              </button>

            </div>
          </div>
        </>
      )}

      {/* ── CHAT VIEW ───────────────────────────────────────────────────────── */}
      {view === 'chat' && activeSession && activeDim && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={backToHome}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeDim.color }} />
                  <p className="text-sm font-bold truncate" style={{ color: 'white' }}>{activeDim.name}</p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#B9F8DD' }}>MQ Builder</p>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

              {/* Loading state for auto-start */}
              {!msgLoaded && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                           style={{ backgroundColor: activeDim.color, animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={msg.id ?? i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                         style={{ backgroundColor: activeDim.color }}>🧠</div>
                  )}
                  <div className="max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed"
                       style={msg.role === 'user'
                         ? { backgroundColor: '#0A2E2A', color: 'white',   borderBottomRightRadius: 4 }
                         : { backgroundColor: 'white',   color: '#0A2E2A', borderBottomLeftRadius: 4, border: `1px solid ${activeDim.color}40` }}>
                    {msg.pending ? (
                      <div className="flex gap-1 items-center py-1">
                        {[0,1,2].map(j => (
                          <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                               style={{ backgroundColor: activeDim.color, animationDelay: `${j*0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      msg.content.split('\n\n').map((para, p) => (
                        <p key={p} className={p > 0 ? 'mt-3' : ''}>{para}</p>
                      ))
                    )}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{ backgroundColor: 'white', borderTop: `1px solid ${activeDim.color}40` }}>
            <div className="max-w-2xl mx-auto px-4 py-3 flex gap-3 items-end">
              <MicButton
                onTranscript={t => setInput(prev => prev ? prev + ' ' + t : t)}
                activeColor={activeDim?.color ?? '#a78bfa'}
                activeBg={activeDim?.bg ?? '#F5F3FF'}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Respond to your coach…"
                rows={1}
                disabled={loading}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none resize-none disabled:opacity-50"
                style={{ border: `2px solid ${activeDim.color}60`, backgroundColor: activeDim.bg, color: '#0A2E2A', maxHeight: 120 }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                }}
              />
              <button onClick={send} disabled={!input.trim() || loading}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: activeDim.color, color: '#0A2E2A' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-xs pb-3" style={{ color: '#9CA3AF' }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}

      {/* ── DEEP DIVE MODAL ─────────────────────────────────────────────────── */}
      {showDeepDive && activeDim && DEEP_DIVE_DATA[activeDim.id] && (() => {
        const slides = DEEP_DIVE_DATA[activeDim.id]
        const slide  = slides[deepDiveSlide]
        return (
          <div
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ backgroundColor: 'rgba(10,46,42,0.75)' }}
            onClick={() => setShowDeepDive(false)}
          >
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl overflow-hidden"
              style={{ maxHeight: '85vh', backgroundColor: 'white' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>🔬</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>The science behind</p>
                    <p className="text-xs font-semibold" style={{ color: activeDim.color }}>{activeDim.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeepDive(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                >
                  {'×'}
                </button>
              </div>

              {/* Slide dots */}
              <div className="flex items-center justify-center gap-2 pb-3 flex-shrink-0">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDeepDiveSlide(i)}
                    className="rounded-full transition-all"
                    style={{
                      width:           i === deepDiveSlide ? 20 : 7,
                      height:          7,
                      backgroundColor: i === deepDiveSlide ? activeDim.color : '#D1D5DB',
                    }}
                  />
                ))}
              </div>

              {/* Slide content */}
              <div className="flex-1 overflow-y-auto px-5 pb-6">
                {/* Researcher header */}
                <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: activeDim.bg }}>
                  <p className="text-base font-black leading-tight" style={{ color: '#0A2E2A' }}>
                    {slide.researcher}
                  </p>
                  <p className="text-xs mt-0.5 mb-2" style={{ color: activeDim.color }}>{slide.work}</p>
                  <p className="text-sm font-semibold italic leading-snug" style={{ color: '#374151' }}>
                    "{slide.tagline}"
                  </p>
                </div>

                {/* Key points */}
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                  Key takeaways
                </p>
                <div className="space-y-3">
                  {slide.points.map((point, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ backgroundColor: activeDim.color + '20', color: activeDim.color }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: '#374151' }}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prev / Next nav */}
              <div className="flex gap-3 px-5 pb-6 pt-3 flex-shrink-0" style={{ borderTop: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setDeepDiveSlide(i => Math.max(0, i - 1))}
                  disabled={deepDiveSlide === 0}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-30 transition-opacity"
                  style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                >
                  ← Previous
                </button>
                {deepDiveSlide < slides.length - 1 ? (
                  <button
                    onClick={() => setDeepDiveSlide(i => i + 1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: activeDim.color, color: '#0A2E2A' }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDeepDive(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: activeDim.color, color: '#0A2E2A' }}
                  >
                    Done ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
