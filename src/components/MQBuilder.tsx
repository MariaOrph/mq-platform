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
    science: 'Tasha Eurich\'s research found that while 95% of people believe they are self-aware, only 10–15% actually are. Goleman\'s emotional intelligence work identifies self-awareness as the foundational pillar on which all other leadership capacities rest — you cannot regulate what you cannot see, and you cannot lead well what you cannot first see in yourself. Daniel Siegel calls this capacity "mindsight": the brain\'s ability to observe its own activity as it happens, rather than being swept along by it. Antonio Damasio\'s somatic marker research shows that the body registers emotional signals before conscious thought catches up — leaders who learn to read these physical cues make faster, more accurate judgements under pressure. Jon Kabat-Zinn\'s mindfulness research provides the mechanism: present-moment awareness is not passive reflection, it is the active practice that builds the internal observer. Jennifer Porter\'s work on reflective leadership shows that most leaders underinvest in reflection, mistaking busyness for effectiveness — when deliberate reflection is consistently the highest-leverage investment they can make.',
  },
  {
    id: 2, name: 'Ego management', color: '#EC4899', bg: '#FCE7F3',
    tagline: 'Letting go of being the expert to enable others.',
    what: 'Ego management is how easily you let go of being the expert, accept challenge, and shift your identity from personal performer to enabler of others. It\'s the difference between leading from strength and leading from fear of looking bad.',
    high: 'You can receive feedback without becoming defensive, admit mistakes openly, share credit generously, and let go of how things get done.',
    low: 'You may notice a pull towards protecting your image, needing to be the expert, or struggling to let go of control when delegating.',
    science: 'Kegan and Lahey\'s research on "Immunity to Change" found that most leadership development failures are caused by hidden commitments to protecting self-image, not lack of skill. Neuroscience confirms that social threat activates the same fight-or-flight response as physical danger — shutting down the very capacities leaders need most. Carol Dweck\'s fixed-mindset research shows that ego protection is fundamentally an identity story: when self-worth is tied to being smart or capable, every challenge becomes a threat to that self-image rather than an opportunity to learn. Jennifer Garvey Berger\'s adult development research shows that most professionals operate from a "socialised mind" — an identity defined by others\' approval — and that the developmental journey of this dimension is the move toward a "self-authoring mind", where your own values define who you are. Michael Gervais\'s research on FOPO (Fear of Other People\'s Opinions) shows how the habitual need for external validation progressively narrows the boldness of leaders\' decisions. Brené Brown\'s research connects this to vulnerability: leaders who can\'t tolerate being wrong consistently create cultures of self-protection around them.',
  },
  {
    id: 3, name: 'Emotional regulation', color: '#ff7b7a', bg: '#FFE8E8',
    tagline: 'Letting emotions inform you rather than run you.',
    what: 'Emotional regulation is the ability to manage your emotional responses — especially under pressure — so they serve your goals rather than derail them. This isn\'t about suppressing emotion; it\'s about processing it so you can respond wisely.',
    high: 'You stay grounded under pressure. Others likely experience you as steady and safe to bring problems to.',
    low: 'Emotional intensity may sometimes hijack your thinking or limit your presence in high-stakes moments.',
    science: 'Amy Arnsten\'s research shows that even moderate stress takes the prefrontal cortex offline, reducing capacity for clear thinking and sound judgment. Joseph LeDoux documented how the amygdala can hijack the whole system in milliseconds. James Gross\'s foundational work established that suppression amplifies the physiological stress response, while reappraisal — reinterpreting a situation before the emotional peak — is far more effective because it works upstream before the feeling fully forms. Lisa Feldman Barrett\'s research shows that emotions are not hardwired reactions but predictions the brain constructs: widening your emotional vocabulary directly shapes what feelings get generated. Stephen Porges\'s Polyvagal theory identifies three nervous system states (ventral vagal, sympathetic, dorsal vagal) and shows that deliberate tools like extended exhalation can activate the vagal brake and shift state in real time. Paul Gilbert\'s research identifies three emotional systems in tension: Threat, Drive, and Soothe — most high-performing leaders are chronically overactive in the first two while the Soothe system, which enables genuine recovery and creativity, is structurally underdeveloped. Bessel van der Kolk\'s research demonstrates that emotional dysregulation is stored in the body, not just the mind — body-based techniques such as controlled breathwork, movement, and physical grounding are often the most direct route to regulation when the nervous system is highly activated. Sigal Barsade\'s research on emotional contagion shows that a leader\'s emotional state spreads through a team within minutes — making regulation not just a personal practice but a direct leadership responsibility. Viktor Frankl captured the core insight: between stimulus and response there is a space — and emotional regulation is the practice of deliberately widening that space.',
  },
  {
    id: 4, name: 'Clarity & communication', color: '#ff9f43', bg: '#FFF0E0',
    tagline: 'Making complexity clear for everyone around you.',
    what: 'Clarity & communication is how effectively you think through complexity and translate it into clear direction, expectations and decisions for others. It includes delegation, feedback, and keeping your team aligned when things change.',
    high: 'You bring real clarity to your communication. Your team knows where they stand, what\'s expected, and why. That directness builds trust and momentum.',
    low: 'You may find that people are often unsure of expectations, or that delegation doesn\'t always land clearly. Communication clarity is a high-leverage development area.',
    science: 'Locke and Latham\'s goal-setting theory, one of the most validated in organisational psychology, shows that specific, clear goals dramatically outperform vague ones. Research on delegation effectiveness consistently shows that the quality of the brief, not the skill of the delegate, is the strongest predictor of outcome. Kim Scott\'s Radical Candor framework demonstrates that the most effective feedback is both caring and direct. Patrick Lencioni\'s research identifies lack of clarity as a root cause of team dysfunction. Harvard Business Review research shows that leaders who communicate the "why" behind decisions create teams that are more autonomous and better at adapting when plans change.',
  },
  {
    id: 5, name: 'Trust & development', color: '#00c9a7', bg: '#D4F5EF',
    tagline: 'Believing in people and investing in their growth.',
    what: 'Trust & development is how deeply you believe in others\' ability to grow, how willingly you give autonomy, and how actively you invest in developing people through coaching and honest feedback.',
    high: 'You genuinely invest in growing the people around you. This is the hallmark of a leader who has made the shift from personal performance to enabling the performance of others.',
    low: 'You may be holding on to too much, giving answers instead of coaching, or not making enough time for development conversations. This is where letting go creates the most leverage.',
    science: 'Carol Dweck\'s growth mindset research shows that leaders who believe people can develop create dramatically different team cultures than those who see talent as fixed. Daniel Goleman\'s coaching leadership style research found it to be one of the most effective yet least used styles. Kim Scott\'s Radical Candor framework shows that caring personally while challenging directly produces the best development outcomes. Google\'s Project Oxygen identified coaching as the number one behaviour of their best managers. Deci and Ryan\'s self-determination theory shows that autonomy is a core driver of intrinsic motivation: people who feel trusted and empowered consistently outperform those who feel controlled.',
  },
  {
    id: 6, name: 'Standards & accountability', color: '#2d4a8a', bg: '#E0E6F5',
    tagline: 'High standards with high support.',
    what: 'Standards & accountability is how consistently you set clear expectations, take ownership of outcomes and hold yourself and others to high standards without micromanaging.',
    high: 'You set a high bar and hold it consistently, with fairness and support. Your team knows what\'s expected and trusts that you\'ll hold everyone, including yourself, to the same standard.',
    low: 'You may be letting things slide, avoiding difficult performance conversations, or being inconsistent about when and how you hold people to account.',
    science: 'Locke and Latham\'s goal-setting theory is one of the most validated theories in industrial-organisational psychology, showing that clear, specific goals dramatically improve performance. Patrick Lencioni\'s Five Dysfunctions framework identifies absence of accountability as a central team failure mode. Zenger and Folkman\'s research consistently highlights holding high standards as a top differentiator of outstanding leaders. Kouzes and Posner\'s The Leadership Challenge, one of the most replicated leadership studies ever conducted, identifies modelling the way as the single behaviour followers most look for in leaders. Research on ownership mindset shows that leaders who take public responsibility for outcomes, rather than attributing blame, create cultures of psychological safety and initiative.',
  },
  {
    id: 7, name: 'Relational intelligence', color: '#a78bfa', bg: '#EDE9FE',
    tagline: 'Building trust and creating space for everyone to contribute.',
    what: 'Relational intelligence is how naturally you build trust, collaborate across difference, and create the conditions for others to contribute fully. It includes navigating conflict, valuing diverse perspectives, and investing in genuine relationships.',
    high: 'You bring a genuinely relational quality to your leadership. People feel seen, heard and enabled by how you engage, and that\'s a rare and powerful thing.',
    low: 'Under pressure, you may shift into task-focused mode, giving people less real attention than they need. Investing in trust-based relationships and inclusive practices will amplify your effectiveness.',
    science: 'Amy Edmondson\'s Harvard research identified psychological safety as the single biggest determinant of team effectiveness. Google\'s Project Aristotle independently confirmed this finding: psychological safety was the number one differentiator, above skills, seniority, and structure. Shore et al.\'s 2011 research identified belonging and uniqueness as the two core dimensions of genuine inclusion. Deloitte\'s large-scale research found inclusive teams are 1.7x more likely to be innovation leaders. John Gottman\'s research found that thriving relationships require a 5:1 ratio of positive to negative interactions, and that the critical skill is not avoiding rupture but repairing it quickly. Robert Waldinger\'s 80-year Harvard Study of Adult Development found that relationship quality is the single strongest predictor of long-term wellbeing and cognitive health.',
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
    {
      researcher: 'Antonio Damasio',
      work:       'Descartes\' Error (1994) / The Feeling of What Happens (1999)',
      tagline:    'The body registers what the mind hasn\'t noticed yet.',
      points: [
        'Damasio\'s research on patients with damage to the ventromedial prefrontal cortex showed that without emotional signals, decision-making becomes paralysed — they could analyse options perfectly but couldn\'t choose. Emotion is not the enemy of good decisions; it is integral to them.',
        'His somatic marker hypothesis shows that the body generates physical signals — gut feelings, tension, a sense of unease — that flag options as good or bad before conscious analysis catches up. These signals are not noise; they are compressed wisdom from past experience.',
        'Leaders who learn to read and trust these signals make faster, more accurate judgements under pressure. The skill is distinguishing genuine somatic markers from anxiety or habitual reaction — which requires the self-awareness to notice the difference.',
        'Self-awareness, for Damasio, is partly a physical practice: learning to read the body\'s signals as information rather than dismissing or being overwhelmed by them.',
      ],
    },
    {
      researcher: 'Jon Kabat-Zinn',
      work:       'Full Catastrophe Living (1990) / Wherever You Go, There You Are (1994)',
      tagline:    'Present-moment awareness is not relaxation — it is the practice that builds the internal observer.',
      points: [
        'Kabat-Zinn developed MBSR (Mindfulness-Based Stress Reduction) at the University of Massachusetts, generating decades of clinical research showing that present-moment awareness reduces stress, anxiety, and reactivity while improving focus, decision-making, and emotional regulation.',
        'His key insight for leaders: mindfulness is not about clearing the mind or achieving calm — it is about developing the capacity to observe your own experience without immediately reacting to it. That gap between stimulus and response is where self-awareness lives.',
        'The practice is simple but not easy: deliberately paying attention to the present moment, on purpose, without judgement. Each time the mind wanders and returns, a new neural pathway is being built — the one that allows observation rather than just reaction.',
        'Research shows consistent mindfulness practice physically changes the brain: the prefrontal cortex increases in density while the amygdala reduces in reactivity. Self-awareness is not just a psychological skill — it is a trainable neurological capacity.',
      ],
    },
    {
      researcher: 'Jennifer Porter',
      work:       '"Why You Should Make Time for Self-Reflection (Even If You Hate It)" (HBR, 2017)',
      tagline:    'Most leaders know they should reflect more. Almost none of them do.',
      points: [
        'Porter\'s research and coaching work found that most leaders chronically underinvest in reflection — not because they don\'t value it, but because they have fundamentally confused busyness with effectiveness. The bias toward action runs so deep that stillness feels like laziness.',
        'The leaders most prone to blind spots and most likely to repeat the same mistakes are the ones who reflect least. The leaders with the widest perspective and most adaptive responses are invariably those with the most deliberate reflection practices.',
        'Reflection, in Porter\'s framework, is not passive rumination — it is deliberate processing of experience to extract useful insight. The key questions are not \'why did this happen?\' but \'what did I actually do, what were the effects, what would I do differently, and what does that tell me about my assumptions?\'',
        'The research-backed minimum is 15 minutes per day of dedicated reflection. Leaders who commit to this consistently show measurable improvements in self-awareness, decision quality, and their ability to stay calm and effective under pressure.',
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
    {
      researcher: 'Carol Dweck',
      work:       'Mindset: The New Psychology of Success (2006)',
      tagline:    'Fixed mindset is not about intelligence — it\'s about ego protection.',
      points: [
        'In the context of ego and identity, Dweck\'s fixed mindset is fundamentally a story about self-image protection. When self-worth is tied to being smart or capable, every challenge to that image becomes an existential threat rather than useful information.',
        'Fixed-mindset leaders avoid challenges (too risky to their image), dismiss negative feedback (too threatening), give up when stuck (failure feels final), and feel threatened by others\' success. Each of these is a form of ego protection masquerading as a leadership behaviour.',
        'The shift to growth mindset is essentially an identity shift: from \'I am capable\' (a fixed self-image to protect) to \'I am someone who learns and grows\' (an identity that makes challenge welcome rather than threatening). This is the ego work of this dimension.',
        'The most important thing a leader can do is model intellectual humility — visibly treating their own failures and limitations as learning material, not threats. This single behaviour shifts the psychological safety of every team they lead.',
      ],
    },
    {
      researcher: 'Jennifer Garvey Berger',
      work:       'Changing on the Job (2012) / Simple Habits for Complex Times (2015)',
      tagline:    'Most professionals are running on a \'socialised mind\' — defined by what others think of them.',
      points: [
        'Garvey Berger built on Kegan\'s constructive developmental theory to create practical frameworks for leadership development. Her central insight: people don\'t just accumulate more knowledge as they develop — their whole way of making meaning changes.',
        'Most adult professionals operate from a \'socialised mind\': their values, perspectives, and identity are largely defined by what significant others think of them. They lead by managing impressions and meeting expectations, which feels like conviction but is fundamentally driven by others\' approval.',
        'The developmental leap of this dimension is toward a \'self-authoring mind\': where you generate your own values, hold your own perspective, and can disagree with authority based on your own reasoning — not others\' judgement of you. This is what it looks like when ego no longer needs constant external validation.',
        'The \'self-transforming mind\' — a further stage — can hold multiple frameworks simultaneously and seek out perspectives that challenge its own. Understanding this developmental arc clarifies what growth in this dimension actually looks like: not just better behaviour, but a genuinely different relationship with identity.',
      ],
    },
    {
      researcher: 'Michael Gervais',
      work:       '"The Most Dangerous Belief You\'ve Never Heard Of" / Finding Mastery podcast',
      tagline:    'FOPO — Fear of Other People\'s Opinions — is one of the biggest limiters of bold leadership.',
      points: [
        'Gervais, a high-performance psychologist working with elite athletes and executives, identified FOPO as a near-universal pattern that systematically narrows the boldness of decisions. When the need for external validation becomes habitual, leaders unconsciously calibrate every choice to what will be approved of — not what will be most effective.',
        'FOPO is different from healthy social awareness. It is the anxious, compulsive monitoring of others\' reactions that produces risk-aversion, people-pleasing, and the suppression of genuinely original thinking. Many leaders mistake it for political intelligence — but it is actually ego in disguise.',
        'The performance consequences are significant: leaders with high FOPO make safer, more predictable decisions; avoid the creative risks that produce the best outcomes; and project less conviction, which reduces their ability to inspire.',
        'The antidote is developing a stable sense of self that doesn\'t depend on external validation — what Gervais calls a \'personal philosophy\': a clear statement of your values and how you want to show up, that acts as an internal reference point independent of others\' reactions.',
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
    {
      researcher: 'Matthew Lieberman',
      work:       'Social: Why Our Brains Are Wired to Connect (2013)',
      tagline:    'Naming an emotion reduces its power — neurologically, not just psychologically.',
      points: [
        'Lieberman\'s UCLA neuroimaging research showed that affect labelling — putting a precise word to an emotional experience — significantly reduces amygdala activation. The act of naming creates distance between the self and the feeling, interrupting the automatic threat response.',
        'The critical distinction is \'I feel anxious\' versus \'I am anxious.\' The first is a report; the second is an identity fusion. Language shapes neural activity: framing emotions as experiences you\'re having (not states you are) measurably changes how the brain processes them.',
        'This finding explains why emotional vocabulary matters — leaders who can precisely distinguish between frustrated, disappointed, overwhelmed, and irritated have more regulatory options available. Imprecise labelling produces imprecise regulation.',
        'The practical technique is simple: when emotional intensity rises, pause and name the feeling as precisely as possible — \'I notice I\'m feeling [word].\' This 2-3 second process activates the prefrontal cortex and creates the gap that allows a conscious response.',
      ],
    },
    {
      researcher: 'James Gross',
      work:       'Emotion Regulation: Conceptual and Empirical Foundations (2014) / Stanford Psychophysiology Laboratory',
      tagline:    'Suppression makes it worse. Reappraisal makes it better. The difference is upstream.',
      points: [
        'Gross is the founding researcher of academic emotion regulation science. His most significant finding: suppression — trying to push emotions down or not show them — amplifies the physiological stress response, degrades memory, and strains social connection. It looks like regulation from the outside but makes everything worse on the inside.',
        'Reappraisal — changing how you interpret a situation before the emotional peak — is far more effective because it works upstream, before the feeling fully forms. Instead of managing the emotion after it arrives, you change the meaning that generates it.',
        'Examples of reappraisal: \'This critical feedback is information that will help me improve\' rather than \'this is an attack on my competence.\' \'This difficult conversation is an investment in the relationship\' rather than \'this is something I have to survive.\' The facts don\'t change; the emotional trajectory does.',
        'For leaders, reappraisal is particularly important because teams observe emotional tone, not just behaviour. A leader who suppresses communicates tension. A leader who has genuinely reappraised communicates stability — which directly reduces the team\'s threat response.',
      ],
    },
    {
      researcher: 'Lisa Feldman Barrett',
      work:       'How Emotions Are Made: The Secret Life of the Brain (2017)',
      tagline:    'Emotions are not things that happen to you — they are predictions your brain constructs.',
      points: [
        'Barrett\'s research overturns the dominant model of emotion as hardwired programs that fire automatically. Her \'theory of constructed emotion\' shows that feelings are predictions: the brain uses past experience, current context, and available concepts to construct its best guess about what is happening and how to respond.',
        'This has profound practical implications. You cannot always stop an emotion from arising — but because emotions are constructed, you can change the inputs: widen your emotional vocabulary (more precise concepts produce more precise predictions), change your physical context, and update past associations through deliberate reappraisal.',
        'Emotional granularity — the ability to make fine-grained distinctions between emotional states — is a measurable skill, and people with higher granularity show better resilience, lower stress reactivity, and more effective regulation under pressure. The vocabulary of emotion is not soft; it is neurologically consequential.',
        'Leaders who understand this model stop asking \'why do I feel this way?\' (which implies a fixed internal state) and start asking \'what is my brain predicting here — and is that prediction accurate?\' This creates a more active, empowered relationship with emotional experience.',
      ],
    },
    {
      researcher: 'Stephen Porges',
      work:       'The Polyvagal Theory (2011) / The Pocket Guide to the Polyvagal Theory (2017)',
      tagline:    'The nervous system has three states — and knowing which one you\'re in changes everything.',
      points: [
        'Porges\'s Polyvagal theory identified three distinct states of the autonomic nervous system. Ventral vagal: safe, socially connected, curious, creative — the state in which thinking and relating work best. Sympathetic: fight or flight, mobilised, activated. Dorsal vagal: shutdown, freeze, disengagement — the deepest stress response.',
        'Leaders move between these states constantly, often without awareness. A tense board meeting can shift someone from ventral to sympathetic in seconds. Accumulated pressure over weeks can push someone toward dorsal — the flat, disconnected state that looks like \'being fine\' but is actually shutdown.',
        'The vagal brake — the neural mechanism of the ventral vagal system — can be deliberately activated through physiological inputs: slow, extended exhalation (longer out than in), gentle eye contact, prosodic voice tone, and controlled movement. These are not relaxation techniques; they are direct inputs to the nervous system that shift state in real time.',
        'For leaders, Polyvagal theory explains why emotional regulation is partly a physiological practice, not just a cognitive one. You cannot think your way from sympathetic to ventral vagal when fully activated. You need to use the body — which is why breathing protocols and physical regulation techniques work when thinking alone does not.',
      ],
    },
    {
      researcher: 'Paul Gilbert',
      work:       'The Compassionate Mind (2009) / Compassion Focused Therapy (2010)',
      tagline:    'Most high-performing leaders are chronically overactive in two emotional systems — and have almost no access to the third.',
      points: [
        'Gilbert\'s research identified three distinct emotional regulation systems in the brain. The Threat system (detecting danger, activating cortisol and adrenaline) keeps us safe. The Drive system (pursuing goals, activating dopamine) creates ambition and achievement. The Soothe system (rest, connection, safety, activating oxytocin) enables genuine recovery, creativity, perspective, and wellbeing.',
        'The systems are designed to balance each other. But the culture and reward structures of most organisations — and many leaders\' own psychological patterns — produce chronic overactivation of Threat and Drive with a severely underdeveloped Soothe system. Leaders keep pushing or keep scanning for problems with no meaningful recovery.',
        'The consequences of chronic Soothe deprivation are predictable: reduced creativity (which requires genuine rest to emerge), narrowing perspective, declining empathy, increased irritability and reactivity, and eventual burnout. Leaders often interpret this as needing to try harder — which makes it worse.',
        'Soothe activation is not weakness — it is the system that restores the cognitive and emotional resources that Drive and Threat deplete. Specific activators include genuine rest, positive social connection, self-compassion, and activities experienced as intrinsically rewarding rather than instrumentally useful.',
      ],
    },
    {
      researcher: 'Bessel van der Kolk',
      work:       'The Body Keeps the Score: Brain, Mind, and Body in the Healing of Trauma (2014)',
      tagline:    'When the nervous system is highly activated, the body will override the thinking mind — every time.',
      points: [
        'Van der Kolk\'s research showed that stress and traumatic activation are stored in the body — in muscular tension patterns, breathing habits, posture, and autonomic reactivity — not just in conscious memory or cognitive patterns. This is why \'just thinking differently\' often fails when someone is highly stressed: the body\'s state overrides the cognitive instruction.',
        'When emotional activation is high, body-based regulation techniques are the primary intervention, not cognitive reframing. Controlled breath (particularly extended exhalation), movement, cold water, physical grounding — these work because they directly shift the body\'s physiological state, which the brain then reads as safe.',
        'Chronic stress accumulation produces habitual tension patterns that keep the nervous system primed for threat even when no threat is present. Leaders who carry years of accumulated stress often feel reactive or \'switched on\' even in genuinely safe contexts. Physical practices are the interventions that shift this most effectively.',
        'For leaders: the ability to regulate your body state before entering high-stakes situations — a board presentation, a difficult conversation, a crisis — is a genuine performance skill. A regulated body produces a regulated mind, which produces regulated leadership.',
      ],
    },
    {
      researcher: 'Sigal Barsade',
      work:       '"The Ripple Effect: Emotional Contagion and Its Influence on Group Behavior" (2002)',
      tagline:    'A leader\'s emotional state spreads through a team within minutes — whether they intend it to or not.',
      points: [
        'Barsade\'s research demonstrated that emotions spread through groups via non-verbal cues — facial expression, body language, tone, posture — in a process that happens largely below conscious awareness. A leader\'s internal state is effectively a team climate intervention, regardless of what they say.',
        'Her experimental studies found that the emotional tone of a group converged rapidly toward whatever emotional state was modelled by the highest-status person in the room. A leader\'s anxiety becomes team anxiety. A leader\'s calm becomes team calm. This happens within minutes, not hours.',
        'The performance consequences are concrete: teams that caught positive emotional contagion showed higher cooperation, lower conflict, and better task performance. Teams that caught negative contagion showed the reverse — even when they couldn\'t identify the source of the mood shift.',
        'Emotional regulation is not a personal wellbeing issue for leaders — it is a direct leadership responsibility and a measurable performance lever. The question is not only \'how do I feel?\' but \'what am I broadcasting, and what effect is it having on my team\'s capacity to think, connect, and perform?\'',
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
    {
      researcher: 'Philip Tetlock',
      work:       'Superforecasting: The Art and Science of Prediction (2015) / Expert Political Judgment (2005)',
      tagline:    'The best thinkers treat their beliefs as hypotheses — held firmly enough to act on, loosely enough to update.',
      points: [
        'Tetlock\'s 20-year study of expert prediction found that most experts perform barely better than chance at long-range forecasting. But a small group — the \'superforecasters\' — consistently outperformed both experts and sophisticated algorithms. The key difference was not intelligence or knowledge but thinking style.',
        'Superforecasters actively seek disconfirming evidence. Where most people unconsciously filter information to confirm existing beliefs, superforecasters deliberately look for what would prove them wrong. They treat their current view as a working hypothesis, not a settled conclusion.',
        'They update quickly and without ego cost. Changing their mind when evidence warrants it feels like accuracy, not failure. This is the opposite of the \'flip-flopper\' anxiety that makes most leaders cling to positions they have stated publicly.',
        'Tetlock\'s practical framework: assign explicit confidence levels to your beliefs (70% sure, not just \'I think so\'), track your predictions over time, and create regular check-ins to ask \'what would change my view?\' This turns belief management from an unconscious habit into a deliberate practice.',
      ],
    },
    {
      researcher: 'Adam Grant',
      work:       'Think Again: The Power of Knowing What You Don\'t Know (2021)',
      tagline:    'The most effective thinkers hold their opinions like scientists — not preachers or prosecutors.',
      points: [
        'Grant identifies three common thinking modes that block cognitive flexibility: Preacher (defending a position because you believe in it), Prosecutor (attacking others\' positions to win), and Politician (seeking approval for your view). All three share a common feature: the goal is to protect or advance your current position, not to find out what\'s true.',
        'The Scientist mode — treating ideas as hypotheses, seeking genuine tests, updating based on evidence — is what distinguishes intellectually flexible leaders. The key shift: separating your identity from your opinions. When a view is just a view (not \'my view\'), revising it feels like learning rather than defeat.',
        'Grant\'s research on \'challenge networks\' shows that the most intellectually effective leaders deliberately surround themselves with people who push back on their thinking. The capacity to genuinely welcome this pushback — rather than tolerate it grudgingly — is the marker of high cognitive flexibility.',
        'The core practice: whenever you find yourself defending a position vigorously, ask \'am I defending this because I have good evidence, or because I stated it publicly and now feel I need to be consistent?\' That question often produces a genuine pause.',
      ],
    },
    {
      researcher: 'Roger Martin',
      work:       'The Opposable Mind (2007) / Creating Great Choices (2017)',
      tagline:    'The best leaders don\'t choose between good options — they hold the tension long enough to create a better one.',
      points: [
        'Martin\'s research on exceptional business leaders found that what distinguished them was not superior analytical ability or better information — it was a specific cognitive capacity he calls integrative thinking: the ability to hold two contradictory models in mind simultaneously without collapsing into one or the other.',
        'Most decision-making under pressure produces false dichotomies: we choose the best available option rather than asking whether the choice itself is the problem. Integrative thinkers question the framing: \'what would have to be true for both of these to be right? What does the tension between them point to?\'',
        'The process requires tolerating cognitive discomfort — the feeling of not yet having an answer — long enough for a genuinely creative synthesis to emerge. Leaders who resolve tension too quickly (to relieve the discomfort of uncertainty) consistently produce conventional solutions.',
        'Martin\'s framework involves four steps: mapping the models (what are the two opposing positions?), examining the tensions (what specifically conflicts?), exploring the possibilities (what would honour both?), and assessing the outcome (is this genuinely better than either original option?).',
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
    {
      researcher: 'William Damon',
      work:       'The Path to Purpose: How Young People Find Their Calling in Life (2008)',
      tagline:    'Beyond-the-self purpose is not just more inspiring — it is measurably more durable.',
      points: [
        'Damon\'s Stanford research found a crucial distinction: purpose oriented toward personal success (achievement, wealth, status) produces motivation that is contingent and fragile — it rises with success and collapses with setback. Beyond-the-self purpose — contributing to something larger than personal gain — produces motivation that is more stable, persistent, and resistant to adversity.',
        'Leaders anchored in contribution-based purpose show greater persistence through difficulty, recover faster from failure, and inspire significantly higher commitment from the people around them. When you know what you\'re building matters beyond yourself, short-term setbacks become less defining.',
        'Damon found that most people don\'t find their purpose — they build it, through a combination of curiosity-driven exploration and deliberate reflection on what genuinely matters to them. Purpose is not discovered wholesale; it emerges incrementally from engaged, reflective action.',
        'The leadership implication: leaders who can articulate a beyond-the-self purpose for their team\'s work — not just commercial goals but a reason that connects to genuine impact — unlock a qualitatively different level of engagement. People work hard for targets. They go beyond what\'s asked for something they believe matters.',
      ],
    },
    {
      researcher: 'Shalom Schwartz',
      work:       '"Universals in the Content and Structure of Values" (1992) / Basic Human Values theory',
      tagline:    'Values don\'t just compete for priority — they structurally conflict, and unresolved, they pull you in opposite directions.',
      points: [
        'Schwartz\'s cross-cultural research — conducted across more than 60 countries — identified 10 universal human values and, critically, showed that they exist in a structured pattern of tensions and compatibilities. Some values naturally reinforce each other. Others structurally conflict.',
        'The most important conflicts for leaders: achievement vs benevolence (succeeding personally vs caring for others), security vs self-direction (stability vs freedom and autonomy), conformity vs stimulation (fitting in vs novelty and challenge). Leaders face these tensions constantly — in decisions about people, strategy, culture, and their own behaviour.',
        'Leaders who haven\'t resolved their values hierarchy experience these tensions as recurring stress, inconsistency, or the feeling of being pulled in opposite directions without knowing why. The value that \'wins\' in the moment depends on whichever is most salient, not which one the leader actually stands for.',
        'Values clarity, in Schwartz\'s model, means knowing not just what you value but what you value most when values conflict. This hierarchy is what makes values genuinely load-bearing under pressure — it gives you a decision rule when things are hard, not just an aspiration list when things are easy.',
      ],
    },
    {
      researcher: 'Adam Grant',
      work:       'Give and Take (2013) / research on prosocial motivation',
      tagline:    'Being motivated by contribution to others isn\'t just more fulfilling — it consistently outperforms self-focused motivation.',
      points: [
        'Grant\'s research on prosocial motivation — being driven primarily by desire to benefit others — found that it produces consistently superior outcomes to self-focused motivation (personal achievement, status, financial reward). People oriented toward contribution outperform those focused on personal advancement over time, despite being initially underestimated.',
        'The mechanism is sustained effort without ego depletion. Self-focused goals require constant reinforcement (am I achieving enough? am I being recognised?) and collapse when external validation is absent. Contribution-focused goals are self-reinforcing: every moment of genuine helpfulness confirms the purpose, regardless of external reward.',
        'For leaders specifically, prosocial motivation changes the nature of leadership itself. Leaders motivated by their team\'s success make systematically different decisions — they delegate more fully, give credit more readily, invest more in development, and are more willing to advocate for their team at personal cost.',
        'Grant\'s research also shows that prosocial motivation must be genuine to produce trust — performative generosity (appearing to contribute while actually seeking credit) produces cynicism. The authenticity of the motivation is legible to those on the receiving end of it.',
      ],
    },
    {
      researcher: 'Simon Sinek',
      work:       'Start With Why (2009)',
      tagline:    'People don\'t follow what you do — they follow why you do it.',
      points: [
        'The Golden Circle: most leaders and organisations communicate from the outside in — What they do, then How, then Why. Sinek\'s insight is that the most inspiring leaders do the opposite: they lead with Why (their core belief), then How, then What.',
        'Sinek\'s central claim: people don\'t buy what you do, they buy why you do it. This explains why some leaders inspire loyalty and followership while others, equally capable, only ever generate compliance.',
        'The most powerful Why statements are oriented toward contribution rather than achievement — not "I want to build a great company" but "I believe in a world where..." — which connects directly to Frankl\'s meaning and Damon\'s beyond-the-self purpose research.',
        'Sinek is a practitioner and leadership communicator rather than an academic researcher. His framework is the most accessible bridge between the psychology of purpose (Frankl, Damon, Deci and Ryan) and the practice of articulating and transmitting it to others.',
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
    {
      researcher: 'John Gottman',
      work:       'The Seven Principles for Making Marriage Work (1999) / Why Marriages Succeed or Fail (1994)',
      tagline:    'What makes relationships thrive vs fail isn\'t conflict — it\'s the ratio and the repair.',
      points: [
        'Gottman\'s research — originally on marriages but extensively validated in workplace contexts — identified the 5:1 ratio as a predictor of relationship health: thriving relationships have at least five positive interactions for every negative one. Most high-pressure leadership environments invert this without leaders realising it — they notice problems more than progress, which means teams experience a net negative relational environment.',
        'He identified four behaviours that reliably destroy relationships: contempt (communicating superiority or disgust), criticism (attacking the person rather than the behaviour), stonewalling (emotional withdrawal), and defensiveness (refusing responsibility and counter-attacking). These map directly onto leadership failure patterns — the contemptuous leader who rolls their eyes in meetings, the defensive leader who never owns mistakes.',
        'His most practically important finding: the ability to repair matters more than the absence of rupture. All relationships go through moments of disconnection — the leaders who maintain strong relational cultures are those who repair quickly, explicitly, and without grudge. \'I came at that too hard\' or \'I should have listened better there\' are among the highest-leverage leadership statements available.',
        'The practical tool Gottman developed is the \'bid\' — small moments of connection-seeking that people constantly make toward each other. Leaders who respond to bids build relational capital rapidly. Leaders who miss or dismiss bids erode it, often without noticing.',
      ],
    },
    {
      researcher: 'Robert Waldinger',
      work:       '"What Makes a Good Life?" (TED Talk, 2015) / The Good Life (2023)',
      tagline:    'The longest study of human flourishing found one answer — and it wasn\'t achievement.',
      points: [
        'The Harvard Study of Adult Development has followed the lives of 724 men (and now their descendants) since 1938 — the longest-running study of its kind. The headline finding, confirmed across 80+ years: the single strongest predictor of long-term wellbeing, cognitive health in later life, and subjective happiness was the quality of relationships — not wealth, fame, professional status, or physical health.',
        'Waldinger found that people who were most satisfied with their relationships at age 50 were the healthiest at age 80. Loneliness and relationship quality predicted cognitive decline more reliably than any other measured variable, including cholesterol levels and exercise habits.',
        'The implication for leaders is direct: investing in relationship quality — with team members, peers, and direct reports — is not a soft priority alongside the \'real work.\' On the longest time horizon available, it is the highest-return investment a leader can make in both their own wellbeing and the performance of those around them.',
        'Waldinger also found that quality matters more than quantity. Not the number of relationships but the depth of safety, mutual respect, and genuine interest in each other\'s experience. Two or three relationships characterised by genuine trust outperform a wide network of surface connections.',
      ],
    },
    {
      researcher: 'David Rock',
      work:       'SCARF: A Brain-Based Model for Collaborating with and Influencing Others (2008)',
      tagline:    'Five social triggers determine whether people feel safe enough to think clearly, connect genuinely, and perform at their best.',
      points: [
        'Rock\'s neuroleadership research identified five social domains that the brain monitors for threat or reward: Status (relative importance to others), Certainty (ability to predict the future), Autonomy (sense of control over choices), Relatedness (sense of safety with others), and Fairness (perception of fair exchanges).',
        'A threat in any of these domains activates the same neural fight-or-flight response as a physical threat — reducing PFC function, narrowing thinking, and increasing defensiveness. Leaders routinely trigger these threats without realising it: a vague comment about someone\'s work (Status), an unexplained change (Certainty), micromanagement (Autonomy), public correction (Relatedness), perceived favouritism (Fairness).',
        'The Relatedness domain is particularly important: it determines whether someone experiences the leader as in-group (safe, connected, collaborative) or out-group (threatening, distant, evaluating). In-group signals unlock candour, creativity, and commitment. Out-group signals produce self-protection and compliance.',
        'Before key interactions, leaders can run a SCARF check: \'am I about to trigger a threat response in any of these five areas?\' Small adjustments — explaining the reason for a decision, acknowledging someone\'s expertise before challenging them, giving people choice in how they approach something — can shift a threat response to a reward response without changing the substance of what\'s being said.',
      ],
    },
    {
      researcher: 'Google Project Aristotle',
      work:       'Re:Work / Project Aristotle (2012-2016)',
      tagline:    'Google analysed 180 of their own teams to find what made the difference — and got one clear answer.',
      points: [
        'Google\'s People Operations team spent two years studying 180+ internal teams to identify what made the highest-performing ones different. They tested dozens of variables: individual intelligence, personality types, seniority, team size, communication patterns. None of them predicted team performance reliably.',
        'Psychological safety — a shared belief that the team is safe for interpersonal risk-taking — was the single most important factor. Teams where members felt safe to speak up, admit mistakes, ask naive questions, and challenge each other performed significantly better across every measure: execution, creativity, and team satisfaction.',
        'What surprised Google was that the other four factors they identified (dependability, structure and clarity, meaning, and impact) were also important but only functional if psychological safety was present. Safety is the foundation on which everything else is built.',
        'The practical implications Google drew: team performance is less about who is on the team than how they interact. Leaders who actively build psychological safety — by modelling fallibility, rewarding candour, and visibly responding well to challenge — create a structural performance advantage that compounds over time.',
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
    {
      researcher: 'Albert Bandura',
      work:       'Self-Efficacy: The Exercise of Control (1997) / Social Learning Theory (1977)',
      tagline:    'Belief in your capacity to handle challenges is not a personality trait — it is a buildable skill.',
      points: [
        'Bandura\'s research established self-efficacy — belief in one\'s own capacity to succeed in specific situations — as one of the most powerful predictors of resilience, persistence, and performance under pressure. Crucially, it is not the same as confidence or optimism: it is evidence-based belief, built from a track record of navigating difficulty.',
        'He identified four sources that build self-efficacy: mastery experiences (the most powerful — actually succeeding at hard things), vicarious learning (seeing people similar to yourself navigate challenges successfully), verbal persuasion (credible others affirming your capacity), and physiological states (a regulated body signals capacity to the brain).',
        'Leaders with high self-efficacy set more challenging goals, persist longer when things get difficult, recover faster from setbacks, and experience failure as instructive rather than defining. Leaders with low self-efficacy set conservative goals, give up earlier, and interpret setbacks as evidence of inadequacy.',
        'The key practical insight: self-efficacy is built through deliberate exposure to challenge, not through avoiding it. Each time a leader navigates something difficult — even imperfectly — and reflects explicitly on what they did and what they can do, they are making a deposit. Over time, this builds a bank of evidence that they can handle what comes next.',
      ],
    },
    {
      researcher: 'Alia Crum',
      work:       '"Rethinking Stress: The Role of Mindsets in Determining the Stress Response" (2013) / Stanford Mind & Body Lab',
      tagline:    'The mindset you bring to stress changes what stress does to your body and your performance.',
      points: [
        'Crum\'s experimental research at Yale and Stanford showed that people\'s beliefs about stress — whether they view it as enhancing or debilitating — have measurable effects on cortisol levels, heart rate recovery, performance outcomes, and long-term health. The stress itself is not the determining variable; the mindset about it is.',
        'In her most-cited experiment, showing participants a short video framing stress as enhancing vs debilitating produced measurable differences in physiological responses and performance under identical stressors. The intervention was a few minutes. The effects were significant.',
        'The \'stress is enhancing\' mindset is not toxic positivity or pretending difficulty doesn\'t exist. It is a more accurate view: stress is the body mobilising resources for a challenge. Whether those resources are deployed effectively or destructively depends largely on the interpretation of what\'s happening.',
        'The practical shift: instead of \'I\'m so stressed\' (which frames stress as something happening to you, with negative valence), try \'I\'m activated\' or \'I\'m in high-demand mode.\' This is not a linguistic trick — it activates a different physiological response and produces different performance outcomes.',
      ],
    },
    {
      researcher: 'Keller et al. / Kelly McGonigal',
      work:       'Health Psychology (2012) / "How to Make Stress Your Friend" (TED, 2013)',
      tagline:    'High stress only predicts worse health outcomes if you believe it does.',
      points: [
        'Keller and colleagues tracked 28,753 adults in the US over eight years, measuring both their stress levels and their beliefs about whether stress was harmful to their health. High stress was associated with a 43% increased risk of dying — but only in people who believed stress was harmful. People with equally high stress who did not hold that belief were among the least likely to die of anyone in the study.',
        'This is one of the most striking findings in modern stress research: the perception of stress as harmful appears to be a more accurate predictor of health outcomes than the actual level of stress experienced. Believing \'stress is bad for me\' may be more dangerous than the stress itself.',
        'Kelly McGonigal, who referenced this research in one of the most-watched TED talks ever delivered, notes a painful corollary: public health messaging that emphasises the dangers of stress may have inadvertently increased those dangers by installing the harmful-stress belief in millions of people.',
        'For leaders who regularly face high-pressure environments — which is most of them — shifting from a \'stress is depleting me\' to a \'stress is preparing me\' mindset is a direct performance and health intervention, backed by longitudinal epidemiological data.',
      ],
    },
    {
      researcher: 'Richard Tedeschi & Lawrence Calhoun',
      work:       '"Posttraumatic Growth: Conceptual Foundations and Empirical Evidence" (2004)',
      tagline:    'Many people don\'t just recover from adversity — they grow in specific, measurable ways because of it.',
      points: [
        'Tedeschi and Calhoun coined \'post-traumatic growth\' to describe a phenomenon observed across hundreds of adversity survivors: many people reported not just returning to baseline but developing in ways that would not have happened without the difficulty. This is not resilience (bouncing back) but transformation (bouncing forward).',
        'They identified five specific domains of PTG: greater personal strength (\'I can handle whatever comes\'), new possibilities (paths that become visible after old ones close), relating to others (deeper compassion and connection), appreciation of life (renewed awareness of what matters), and existential change (shifts in core beliefs about meaning and purpose).',
        'The key variable is not the adversity itself but the cognitive and narrative processing around it. PTG is most likely when the person engages in \'deliberate rumination\' — active, purposeful reflection on what happened and what it means, rather than avoidance or passive brooding.',
        'For leaders, this research reframes every major setback as a potential development catalyst rather than just a problem to solve. The question is not \'how do I get past this?\' but \'what is this teaching me, and who might I become because of it?\' Building this reflective habit before adversity arrives means the growth capacity is already in place when it\'s most needed.',
      ],
    },
    {
      researcher: 'George Bonanno',
      work:       '"Loss, Trauma, and Human Resilience" (2004) / The End of Trauma (2021)',
      tagline:    'Resilience isn\'t a gift some people have — it\'s the most common human response to adversity.',
      points: [
        'Bonanno\'s longitudinal research challenged the prevailing model of trauma response, which assumed that most people would follow a grief trajectory of acute distress followed by gradual recovery. His data showed that the most common response to even severe adversity was a resilience trajectory: maintained stable functioning with relatively brief, manageable disruption.',
        'This finding has a significant practical implication: the cultural narrative that tells us adversity will be devastating is often inaccurate. Most people are more resilient than they — or anyone else — expects. Resilience is not a rare gift that some people have; it is the baseline human capacity, which gets built or eroded depending on how we relate to difficulty.',
        'The factors Bonanno identifies as most protective: a stable and flexible sense of identity (not too rigid, not too fragile), a capacity for positive emotion even in difficult contexts, regulatory flexibility (being able to both engage with and let go of difficult emotions as the situation requires), and pragmatic coping (focusing on what can be done rather than what can\'t).',
        'The implications for leaders: the most important resilience investment is not building stoicism but maintaining the conditions that keep the baseline resilient — adequate rest, positive connection, a stable sense of purpose, and the reflective habits that convert adversity into learning rather than accumulated psychological weight.',
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

  // ── Hide the bottom nav + lock body scroll so Android doesn't shift the
  //    fixed overlay up when the on-screen keyboard opens. Same pattern as
  //    CoachingRoom (see globals.css .hide-when-overlay-open rule).
  useEffect(() => {
    document.body.classList.add('overlay-open')
    const prevOverflow = document.body.style.overflow
    const prevPosition = document.body.style.position
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    return () => {
      document.body.classList.remove('overlay-open')
      document.body.style.overflow = prevOverflow
      document.body.style.position = prevPosition
      document.body.style.width = ''
    }
  }, [])

  // Track the real visible viewport height so the overlay resizes cleanly
  // when the mobile keyboard opens (see CoachingRoom for full explanation).
  const [visibleHeight, setVisibleHeight] = useState<number | null>(null)
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    if (!vv) return
    const update = () => setVisibleHeight(vv.height)
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

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
    <div
      className="fixed left-0 right-0 top-0 z-50 flex flex-col"
      style={{
        backgroundColor: '#F4FDF9',
        height: visibleHeight ? `${visibleHeight}px` : '100dvh',
      }}
    >

      {/* ── HOME VIEW ───────────────────────────────────────────────────────── */}
      {view === 'home' && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                     style={{ backgroundColor: '#0AF3CD' }}>🧠</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'white' }}>Mindset Gym</p>
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
          <div style={{ backgroundColor: '#0A2E2A', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
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
                <p className="text-xs" style={{ color: '#B9F8DD' }}>Mindset Gym</p>
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
                      Research &amp; insights
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
          <div style={{ backgroundColor: '#0A2E2A', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
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
                <p className="text-xs mt-0.5" style={{ color: '#B9F8DD' }}>Mindset Gym</p>
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
                    <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>Research &amp; insights</p>
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
