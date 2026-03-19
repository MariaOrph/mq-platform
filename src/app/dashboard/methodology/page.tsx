export default function MethodologyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <a href="/dashboard" className="text-sm hover:opacity-70 transition-opacity"
             style={{ color: 'rgba(185,248,221,0.6)' }}>
            ← Back to dashboard
          </a>
          <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>
            The Research Behind MQ
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(185,248,221,0.6)' }}>
            How the MQ framework and Culture Lab are grounded in leadership science
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* ── Section 1: Framework ─────────────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            The Framework: Inner Game and Outer Game
          </h2>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            Effective leadership operates on two levels — and the research across decades of psychology,
            organisational behaviour, and leadership science consistently supports this distinction.
          </p>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            The <strong>inner game</strong> is about the psychological quality of the leader: how
            self-aware, grounded, flexible, and mature they are as a person. This is what MQ measures.
            The <strong>outer game</strong> is about the cultural conditions the leader creates for their
            team — the environment that either enables or constrains the performance of every person
            around them. This is what Culture Lab develops.
          </p>

          {/* Callout */}
          <div className="rounded-xl px-5 py-4"
               style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #0AF3CD' }}>
            <p className="text-sm leading-relaxed italic font-medium" style={{ color: '#0A2E2A' }}>
              The inner game determines the quality of your judgment. The outer game determines
              whether that quality gets translated into collective performance.
            </p>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            Three major bodies of research underpin the framework as a whole:
          </p>

          <div className="space-y-4">
            {[
              {
                name: 'Daniel Goleman\'s emotional intelligence research',
                cite: 'Harvard Business Review, 1995–1998',
                body: 'His landmark finding that EI — not IQ or technical skill — accounts for the majority of what distinguishes outstanding senior leaders from average ones. His four-quadrant model (self-awareness, self-management, social awareness, relationship management) informs the psychological foundation of the MQ dimensions.',
              },
              {
                name: 'Robert Kegan\'s adult development theory',
                cite: 'Harvard',
                body: 'The argument that leadership failures are rarely skill or knowledge problems but developmental ones — rooted in the complexity and stability of the leader\'s inner operating system. Kegan\'s work provides the theoretical basis for treating leadership effectiveness as a question of maturity, not just competence.',
              },
              {
                name: 'Google\'s Project Aristotle',
                cite: '2016',
                body: 'A large-scale study of 180+ teams that identified the specific cultural factors driving team effectiveness. Psychological safety (ranked first), accountability (second), and meaning and purpose (fourth) map directly to three of the four Culture Lab topics — making it among the most-cited contemporary research on team performance.',
              },
            ].map(item => (
              <div key={item.name} className="rounded-xl p-4"
                   style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#0A2E2A' }}>
                  {item.name}
                  <span className="font-normal ml-1.5" style={{ color: '#9CA3AF' }}>· {item.cite}</span>
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: MQ Dimensions ─────────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            The MQ Dimensions — Research Foundations
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            MQ measures seven psychological dimensions that together describe the maturity and quality
            of a leader&apos;s inner operating system. Each is grounded in peer-reviewed psychology and
            leadership research.
          </p>

          <div className="space-y-3">
            {[
              {
                emoji: '🔍', name: 'Self-Awareness',
                color: '#fdcb5e', bg: '#FEF5D9',
                desc: 'The capacity to see yourself clearly — your strengths, blind spots, values, and the effect you have on others.',
                anchor: 'Tasha Eurich\'s research (Insight, 2017) found that while 95% of leaders believe they are self-aware, only around 10–15% actually are. Green Peak Partners/Cornell research identified self-awareness as the single strongest predictor of leadership success. Also a foundational pillar in Goleman\'s EI model.',
              },
              {
                emoji: '🪞', name: 'Ego & Identity',
                color: '#EC4899', bg: '#FCE7F3',
                desc: 'The stability and flexibility of the self — how much the ego needs to protect itself, and how attached the leader is to being right, in control, or seen in a particular way.',
                anchor: 'Robert Kegan\'s subject-object theory and Bill Torbert\'s 25-year longitudinal study found ego development stage to be the strongest predictor of leadership effectiveness and the ability to lead transformation. Also supported by research on narcissistic leadership derailment (Rosenthal & Pittinsky) and Chris Argyris\'s work on defensive reasoning.',
              },
              {
                emoji: '🌊', name: 'Emotional Regulation',
                color: '#ff7b7a', bg: '#FFE8E8',
                desc: 'The ability to manage emotional responses under pressure — not suppressing emotion, but directing it constructively.',
                anchor: 'James Gross\'s process model of emotion regulation (Stanford, 1998) is among the most cited papers in psychology. Richard Davidson\'s neuroscience research demonstrates that emotional regulation is trainable and directly linked to decision quality under stress. Maps to Goleman\'s self-management pillar.',
              },
              {
                emoji: '🔄', name: 'Cognitive Flexibility',
                color: '#ff9f43', bg: '#FFF0E0',
                desc: 'The ability to hold complexity, revise assumptions, and remain genuinely open to new evidence — including evidence that challenges existing views.',
                anchor: 'Carol Dweck\'s growth mindset research (Stanford) is the most accessible anchor. Roger Martin\'s integrative thinking and Kegan\'s immunity to change theory cover the deeper developmental layer. McKinsey research consistently identifies cognitive agility as a top differentiator at senior leadership levels.',
              },
              {
                emoji: '⭐', name: 'Values & Purpose',
                color: '#00c9a7', bg: '#D4F5EF',
                desc: 'The depth and stability of the leader\'s sense of what they stand for — and how consistently that shows up in decisions and behaviour.',
                anchor: 'Shalom Schwartz\'s universal values theory (replicated across 80+ countries) provides the foundational academic anchor. The authentic leadership research of Bill George and Bruce Avolio, and Nick Craig/Scott Snook\'s work on purpose, provide leadership-specific grounding. Deci & Ryan\'s self-determination theory supports the performance benefits of intrinsic purpose.',
              },
              {
                emoji: '🤝', name: 'Relational Mindset',
                color: '#2d4a8a', bg: '#E0E6F5',
                desc: 'The fundamental orientation toward others — whether the leader approaches relationships as transactional or as a source of genuine mutual investment.',
                anchor: 'Overlaps with Goleman\'s social awareness and relationship management pillars. Supported by Heifetz & Linsky\'s adaptive leadership framework, the Mayer, Davis & Schoorman trust model, and Robert Greenleaf\'s servant leadership research.',
              },
              {
                emoji: '🔥', name: 'Adaptive Resilience',
                color: '#a78bfa', bg: '#EDE9FE',
                desc: 'The capacity to recover from setbacks, learn from adversity, and remain grounded under sustained pressure.',
                anchor: 'Martin Seligman\'s positive psychology and PERMA model, Angela Duckworth\'s grit research, and Luthans et al.\'s psychological capital (PsyCap) research — which identified resilience as one of four core psychological resources predicting sustained performance. Also connected to post-traumatic growth research (Tedeschi & Calhoun).',
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
                    <span className="font-semibold" style={{ color: '#1B5E56' }}>Research anchor: </span>
                    {dim.anchor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Culture Lab ────────────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            The Culture Lab Topics — Research Foundations
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            Culture Lab addresses the outer game: the cultural conditions a leader creates for their team.
            The four topics reflect the factors most consistently linked to team performance across the
            organisational behaviour and leadership science literature.
          </p>

          <div className="space-y-3">
            {[
              {
                emoji: '⭐', name: 'Values',
                color: '#F97316', bg: '#FFF3E8',
                desc: 'How leaders close the gap between their organisation\'s stated values and how those values actually show up in daily leadership behaviour.',
                anchor: 'Edgar Schein\'s organisational culture model positions values as the layer most directly shaped by leader behaviour. Collins & Porras\'s Built to Last research found values-driven companies dramatically outperformed long-term. Kouzes & Posner\'s The Leadership Challenge — one of the most replicated leadership studies ever conducted — identifies modelling the way as the single behaviour followers most look for in leaders.',
              },
              {
                emoji: '🛡️', name: 'Psychological Safety',
                color: '#6366F1', bg: '#EEF2FF',
                desc: 'Creating the conditions for people to speak up, take risks, and be honest without fear of punishment or humiliation.',
                anchor: 'Amy Edmondson\'s foundational research (Harvard, 1999 onwards) is among the most cited work in organisational behaviour. Google\'s Project Aristotle (2016) found psychological safety to be the single strongest predictor of team effectiveness — above individual talent, seniority, and team composition. Timothy Clark\'s Four Stages of Psychological Safety extends the practical framework for leaders.',
              },
              {
                emoji: '🎯', name: 'Accountability',
                color: '#06D6A0', bg: '#E0FBF5',
                desc: 'Building a team culture of clear expectations, honest follow-through, and high standards — without blame, fear, or micromanagement.',
                anchor: 'Goal-setting theory (Locke & Latham) — one of the most validated theories in industrial-organisational psychology — provides the research foundation for how clarity and commitment drive performance. Patrick Lencioni\'s Five Dysfunctions framework identifies absence of accountability as a central team failure mode. Zenger & Folkman\'s research consistently highlights holding high standards as a top differentiator of outstanding leaders.',
              },
              {
                emoji: '🤝', name: 'Inclusion',
                color: '#F59E0B', bg: '#FFFBEB',
                desc: 'Ensuring every person genuinely belongs, gets heard, and has an equal chance to contribute — including through diversity of thought and perspective.',
                anchor: 'Shore et al.\'s 2011 research on inclusion in workgroups identified belonging and uniqueness as the two core dimensions of genuine inclusion. Deloitte\'s large-scale research on inclusive leadership found inclusive teams are 1.7x more likely to be innovation leaders. Edmondson\'s psychological safety work is directly adjacent: inclusion determines whether safety is equally distributed across the team or only available to some.',
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
                    <span className="font-semibold" style={{ color: '#1B5E56' }}>Research anchor: </span>
                    {topic.anchor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Beyond EQ ─────────────────────────────────────────── */}
        <section className="rounded-2xl p-8 space-y-5"
                 style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>
            Beyond EQ — Why Maturity Is the Missing Piece
          </h2>

          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            The most common question about MQ is whether it is simply a repackaging of emotional
            intelligence. The answer is no — and understanding exactly why goes to the heart of what
            MQ is for.
          </p>

          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1B5E56' }}>
              EQ is a competency model. MQ is a maturity model.
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              Goleman&apos;s EQ framework asks: what emotional and social skills does this person have?
              Can they identify their emotions, manage their reactions, read a room, build relationships?
              These are measurable capabilities — and EQ tools assess them as such.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#374151' }}>
              MQ asks a fundamentally different question: from what level of psychological development
              is this person operating? How stable, flexible, and grounded is their inner operating
              system? This is not about skills. It is about the foundation from which skills get used.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#374151' }}>
              Two leaders can score identically on an EQ assessment but operate from very different
              levels of maturity. The leader with higher MQ will deploy the same skills more wisely,
              with less ego distortion, with greater adaptability — and will hold up far better when
              real pressure arrives.
            </p>
          </div>

          <div className="rounded-xl px-5 py-4"
               style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #0AF3CD' }}>
            <p className="text-sm leading-relaxed italic font-medium" style={{ color: '#0A2E2A' }}>
              &ldquo;EQ skills training can teach a leader how to have a difficult conversation.
              MQ determines whether their ego will let them actually hear what comes back.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1B5E56' }}>
              What EQ leaves out
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#374151' }}>
              Two MQ dimensions have no equivalent in Goleman&apos;s framework — and they are arguably
              the most predictive of leadership failure:
            </p>
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: '#FCE7F3', border: '1px solid #FBCFE8' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  <span className="font-bold" style={{ color: '#0A2E2A' }}>Ego &amp; Identity — </span>
                  EQ treats the self as a relatively fixed backdrop and focuses on competencies.
                  It does not examine whether the ego is stable enough to be genuinely challenged,
                  or flexible enough to change. This is why many technically skilled, emotionally
                  aware leaders still derail: their ego gets in the way at the critical moments.
                  More leaders fail because of ego problems than any other single factor — and EQ
                  sidesteps this almost entirely.
                </p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF0E0', border: '1px solid #FED7AA' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  <span className="font-bold" style={{ color: '#0A2E2A' }}>Cognitive Flexibility — </span>
                  EQ is fundamentally about emotional and social competence. Cognitive flexibility —
                  the capacity to hold complexity, revise assumptions, and remain genuinely open to
                  being wrong — is a distinct domain, grounded in different research (Dweck, Kegan,
                  cognitive psychology) and not addressed by EQ frameworks.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1B5E56' }}>
              The limits of skills-based approaches
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              The deeper problem with treating leadership development purely as a skills question is
              that skills can be learned without the person actually developing. A narcissistic leader
              can learn active listening techniques. A highly defensive leader can memorise a feedback
              framework. A fragile ego can be coached on the mechanics of a difficult conversation.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#374151' }}>
              As critics of EQ have noted — including organisational psychologist Adam Grant — EQ can
              be gamed. Narcissists often score well on certain EQ measures precisely because they are
              adept at reading people. The correlation between EQ training and sustained leadership
              improvement is weaker than the EQ industry claims, because skills without maturity are
              unstable under pressure.
            </p>
          </div>

          <div className="rounded-xl px-5 py-4"
               style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #0AF3CD' }}>
            <p className="text-sm leading-relaxed italic font-medium" style={{ color: '#0A2E2A' }}>
              EQ was the right answer to &ldquo;IQ isn&apos;t enough.&rdquo; MQ is the right answer
              to &ldquo;EQ skills aren&apos;t enough either — because skills without maturity will
              fail you at the moments that matter most.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1B5E56' }}>
              The positioning
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              MQ does not replace or dismiss EQ. The research Goleman built on remains valid and
              important. MQ builds on that foundation and goes further — shifting the question from
              &ldquo;what skills does this leader have?&rdquo; to &ldquo;how developed is the person
              operating those skills?&rdquo;
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#374151' }}>
              This is the direction the field has been moving. Kegan&apos;s adult development work,
              Dweck&apos;s growth mindset research, positive psychology, and the neuroscience of
              emotional regulation all point the same way: what determines leadership effectiveness at
              the highest levels is not the sophistication of the toolkit, but the psychological
              maturity of the person holding it.
            </p>
            <p className="text-sm leading-relaxed mt-3 font-medium" style={{ color: '#0A2E2A' }}>
              That is what MQ measures. And that is why it matters.
            </p>
          </div>

        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="text-center py-2 pb-8">
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            © {new Date().getFullYear()} Mindset Quotient Ltd &nbsp;·&nbsp;
          </span>
          <a href="/privacy" className="text-xs hover:underline" style={{ color: '#9CA3AF' }}>
            Privacy Policy
          </a>
        </div>

      </div>
    </main>
  )
}
