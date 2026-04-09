export default function MethodologyPage() {
  return (
    <main className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30" style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'white' }}>
                Research &amp; Attribution
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(185,248,221,0.6)' }}>
                The psychology and leadership research behind the MQ
              </p>
            </div>
            <a
              href="/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 20, lineHeight: 1 }}
            >×</a>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* ── Section 1: The Framework ────────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            The Framework: Inner Game and Outer Game
          </h2>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            Effective leadership operates on two levels, and the research across decades of psychology,
            organisational behaviour, and leadership science consistently supports this distinction.
          </p>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            The <strong>inner game</strong> is about the psychological quality of the leader: how
            self-aware, grounded, and emotionally regulated they are as a person. These are the
            foundations that determine the quality of every decision, conversation, and interaction.
          </p>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            The <strong>outer game</strong> is about how effectively the leader translates that inner
            quality into the practical work of leading others: communicating with clarity, developing
            people, holding standards, and building the trust and relationships that enable a team
            to perform.
          </p>

          {/* Callout */}
          <div className="rounded-xl px-5 py-4"
               style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #0AF3CD' }}>
            <p className="text-sm leading-relaxed italic font-medium" style={{ color: '#0A2E2A' }}>
              MQ measures both. The inner game determines the quality of your judgment.
              The outer game determines whether that judgment translates into the performance of others.
            </p>
          </div>
        </section>

        {/* ── Section 2: MQ Dimensions ───────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            The MQ Dimensions — Research Foundations
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            MQ measures seven dimensions that together describe how fully a leader has made the shift
            from individual performer to effective leader of others. The first three measure the inner
            game. The last four measure the outer game.
          </p>

          {/* Inner Game label */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1" style={{ backgroundColor: '#E5E7EB' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#05A88E' }}>Inner Game</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#E5E7EB' }} />
          </div>

          <div className="space-y-3">
            {[
              {
                emoji: '🔍', name: 'Self-Awareness',
                color: '#fdcb5e', bg: '#FEF5D9',
                desc: 'How clearly you see your own strengths, blind spots, patterns and impact on others.',
                anchor: 'Tasha Eurich\'s research (Insight, 2017) found that while 95% of leaders believe they are self-aware, only around 10\u201315% actually are. Green Peak Partners/Cornell research identified self-awareness as the single strongest predictor of leadership success. Also a foundational pillar in Goleman\'s emotional intelligence model.',
              },
              {
                emoji: '🪞', name: 'Ego Management',
                color: '#EC4899', bg: '#FCE7F3',
                desc: 'How easily you let go of being the expert, accept challenge, and shift your identity from personal performer to enabler of others.',
                anchor: 'Robert Kegan\'s subject-object theory and Bill Torbert\'s 25-year longitudinal study found ego development stage to be the strongest predictor of leadership effectiveness and the ability to lead transformation. Supported by research on narcissistic leadership derailment (Rosenthal & Pittinsky) and Chris Argyris\'s work on defensive reasoning.',
              },
              {
                emoji: '🌊', name: 'Emotional Regulation',
                color: '#ff7b7a', bg: '#FFE8E8',
                desc: 'How well you notice and interrupt your reactive patterns before they drive your behaviour.',
                anchor: 'James Gross\'s process model of emotion regulation (Stanford, 1998) is among the most cited papers in psychology. Richard Davidson\'s neuroscience research demonstrates that emotional regulation is trainable and directly linked to decision quality under stress. Sigal Barsade\'s research on emotional contagion shows a leader\'s emotional state spreads through a team within minutes.',
              },
            ].map(dim => (
              <div key={dim.name} className="rounded-xl overflow-hidden"
                   style={{ border: '1px solid #F3F4F6' }}>
                <div className="flex items-center gap-3 px-4 py-3"
                     style={{ backgroundColor: dim.bg }}>
                  <span className="text-xl">{dim.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: '#0A2E2A' }}>{dim.name}</span>
                </div>
                <div className="px-4 py-3 space-y-2" style={{ backgroundColor: 'white' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#6B7280' }}>{dim.desc}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    <span className="font-semibold" style={{ color: '#1B5E56' }}>Research basis: </span>
                    {dim.anchor}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Outer Game label */}
          <div className="flex items-center gap-3 pt-4">
            <div className="h-px flex-1" style={{ backgroundColor: '#E5E7EB' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#05A88E' }}>Outer Game</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#E5E7EB' }} />
          </div>

          <div className="space-y-3">
            {[
              {
                emoji: '💬', name: 'Clarity & Communication',
                color: '#ff9f43', bg: '#FFF0E0',
                desc: 'How effectively you think through complexity and translate it into clear direction, expectations and decisions for others.',
                anchor: 'Locke and Latham\'s goal-setting theory, one of the most validated in organisational psychology, shows that specific, clear goals dramatically outperform vague ones. Kim Scott\'s Radical Candor framework demonstrates the most effective feedback is both caring and direct. Lencioni identifies lack of clarity as a root cause of team dysfunction.',
              },
              {
                emoji: '🌱', name: 'Trust & Development',
                color: '#00c9a7', bg: '#D4F5EF',
                desc: 'How deeply you believe in others\' ability to grow, how willingly you give autonomy, and how actively you invest in developing people.',
                anchor: 'Carol Dweck\'s growth mindset research shows that leaders who believe people can develop create dramatically different team cultures. Google\'s Project Oxygen identified coaching as the number one behaviour of their best managers. Deci and Ryan\'s self-determination theory shows autonomy is a core driver of intrinsic motivation.',
              },
              {
                emoji: '📐', name: 'Standards & Accountability',
                color: '#2d4a8a', bg: '#E0E6F5',
                desc: 'How consistently you set clear expectations, take ownership of outcomes and hold yourself and others to high standards.',
                anchor: 'Locke and Latham\'s goal-setting theory provides the research foundation for how clarity and commitment drive performance. Lencioni\'s Five Dysfunctions framework identifies absence of accountability as a central team failure mode. Kouzes and Posner\'s The Leadership Challenge identifies modelling the way as the single behaviour followers most look for in leaders.',
              },
              {
                emoji: '🤝', name: 'Relational Intelligence',
                color: '#a78bfa', bg: '#EDE9FE',
                desc: 'How naturally you build trust, collaborate across difference, and create the conditions for others to contribute fully.',
                anchor: 'Amy Edmondson\'s Harvard research identified psychological safety as the single biggest determinant of team effectiveness. Google\'s Project Aristotle independently confirmed this finding. Shore et al.\'s 2011 research identified belonging and uniqueness as the two core dimensions of genuine inclusion. Deloitte\'s research found inclusive teams are 1.7x more likely to be innovation leaders.',
              },
            ].map(dim => (
              <div key={dim.name} className="rounded-xl overflow-hidden"
                   style={{ border: '1px solid #F3F4F6' }}>
                <div className="flex items-center gap-3 px-4 py-3"
                     style={{ backgroundColor: dim.bg }}>
                  <span className="text-xl">{dim.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: '#0A2E2A' }}>{dim.name}</span>
                </div>
                <div className="px-4 py-3 space-y-2" style={{ backgroundColor: 'white' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#6B7280' }}>{dim.desc}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    <span className="font-semibold" style={{ color: '#1B5E56' }}>Research basis: </span>
                    {dim.anchor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Culture Lab ──────────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            The Culture Lab Topics — Research Foundations
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            Culture Lab is a separate coaching space that addresses the broader cultural conditions
            a leader shapes for their team. The four topics reflect the factors most consistently
            linked to team performance across the organisational behaviour and leadership science literature.
          </p>

          <div className="space-y-3">
            {[
              {
                emoji: '⭐', name: 'Values',
                color: '#F97316', bg: '#FFF3E8',
                desc: 'How leaders close the gap between their organisation\'s stated values and how those values actually show up in daily leadership behaviour.',
                anchor: 'Edgar Schein\'s organisational culture model positions values as the layer most directly shaped by leader behaviour. Collins & Porras\'s Built to Last research found values-driven companies dramatically outperformed long-term. Kouzes & Posner\'s The Leadership Challenge identifies modelling the way as the single behaviour followers most look for in leaders.',
              },
              {
                emoji: '🛡️', name: 'Psychological Safety',
                color: '#6366F1', bg: '#EEF2FF',
                desc: 'Creating the conditions for people to speak up, take risks, and be honest without fear of punishment or humiliation.',
                anchor: 'Amy Edmondson\'s foundational research (Harvard, 1999 onwards) is among the most cited work in organisational behaviour. Google\'s Project Aristotle (2016) found psychological safety to be the single strongest predictor of team effectiveness. Timothy Clark\'s Four Stages of Psychological Safety extends the practical framework for leaders.',
              },
              {
                emoji: '🎯', name: 'Accountability',
                color: '#06D6A0', bg: '#E0FBF5',
                desc: 'Building a team culture of clear expectations, honest follow-through, and high standards without blame or micromanagement.',
                anchor: 'Goal-setting theory (Locke & Latham) provides the research foundation for how clarity and commitment drive performance. Patrick Lencioni\'s Five Dysfunctions framework identifies absence of accountability as a central team failure mode. Zenger & Folkman\'s research highlights holding high standards as a top differentiator of outstanding leaders.',
              },
              {
                emoji: '🤝', name: 'Inclusion',
                color: '#F59E0B', bg: '#FFFBEB',
                desc: 'Ensuring every person genuinely belongs, gets heard, and has an equal chance to contribute.',
                anchor: 'Shore et al.\'s 2011 research on inclusion in workgroups identified belonging and uniqueness as the two core dimensions of genuine inclusion. Deloitte\'s large-scale research on inclusive leadership found inclusive teams are 1.7x more likely to be innovation leaders. Edmondson\'s psychological safety work is directly adjacent: inclusion determines whether safety is equally distributed across the team.',
              },
            ].map(topic => (
              <div key={topic.name} className="rounded-xl overflow-hidden"
                   style={{ border: '1px solid #F3F4F6' }}>
                <div className="flex items-center gap-3 px-4 py-3"
                     style={{ backgroundColor: topic.bg }}>
                  <span className="text-xl">{topic.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: '#0A2E2A' }}>{topic.name}</span>
                </div>
                <div className="px-4 py-3 space-y-2" style={{ backgroundColor: 'white' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#6B7280' }}>{topic.desc}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    <span className="font-semibold" style={{ color: '#1B5E56' }}>Research basis: </span>
                    {topic.anchor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="text-center py-2 pb-8">
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            © {new Date().getFullYear()} Mindset Quotient® Ltd &nbsp;·&nbsp;
          </span>
          <a href="/privacy" className="text-xs hover:underline" style={{ color: '#9CA3AF' }}>
            Privacy Policy
          </a>
        </div>

      </div>
    </main>
  )
}
