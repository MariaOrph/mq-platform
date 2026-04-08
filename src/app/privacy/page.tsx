export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'white' }}>Privacy Policy</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(185,248,221,0.6)' }}>
                Mindset Quotient® Ltd &nbsp;·&nbsp; Last updated: April 2026
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

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="rounded-2xl p-8 space-y-8" style={{ backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          {/* Intro */}
          <section>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              Mindset Quotient® (&quot;MQ&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your personal data and being transparent about how we use it. This policy explains what we collect, why we collect it, who can see it, and your rights under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#374151' }}>
              Mindset Quotient® is the data controller for personal data processed through this platform. If you have any questions about this policy, contact us at{' '}
              <a href="mailto:privacy@mindsetquotient.com" className="underline" style={{ color: '#05A88E' }}>
                privacy@mindsetquotient.com
              </a>.
            </p>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* What we collect */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>1. What data we collect</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p><span className="font-medium">Account and profile data.</span> Your name, email address, and professional role, provided when you are invited to the platform or create an account.</p>
              <p><span className="font-medium">MQ Assessment responses and scores.</span> Your answers to the MQ assessment questionnaire and the resulting dimension scores. These are used to personalise your coaching experience.</p>
              <p><span className="font-medium">Coaching conversation content.</span> The messages you exchange with your AI coach in the coaching room. These are stored to maintain continuity within and across sessions.</p>
              <p><span className="font-medium">Personal notes.</span> Anything you write in the My Notes section of the platform. These are stored securely and are private to you.</p>
              <p><span className="font-medium">Values ratings.</span> If your organisation has set up a Values in Action check-in, your self-ratings against company values and behaviours are stored and used to personalise coaching.</p>
              <p><span className="font-medium">360 feedback responses.</span> If you participate in or request 360 feedback, the responses and themes are stored and used to inform your coaching experience.</p>
              <p><span className="font-medium">Usage data.</span> Session counts, login activity, and engagement metrics (for example, whether you have completed the assessment). This is used to improve the platform and generate anonymised cohort-level reporting.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* How we use it */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>2. How we use your data</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We use your personal data to provide, personalise, and improve the MQ platform. Specifically:</p>
              <p><span className="font-medium">To deliver coaching.</span> Your assessment scores, conversation history, and values ratings are used to generate personalised coaching responses. This processing is necessary to perform our contract with you.</p>
              <p><span className="font-medium">To maintain continuity.</span> A brief summary of key themes from your coaching sessions is stored so your coach can build on previous conversations. You can request deletion of this memory at any time.</p>
              <p><span className="font-medium">To send reminders and nudges.</span> We may send you email reminders, coaching nudges, or engagement prompts to help you get the most from the platform. You can opt out of non-essential emails at any time.</p>
              <p><span className="font-medium">To improve the platform.</span> We may use anonymised and aggregated data to analyse patterns, improve coaching quality, and develop new features. This data cannot be used to identify you individually.</p>
              <p>Our legal basis for processing is primarily the performance of a contract (providing you with the platform) and legitimate interests (improving the platform in a way that does not override your rights).</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Confidentiality of coaching conversations */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>3. Confidentiality of your coaching conversations and personal notes</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>Your coaching conversations are private. They are not accessible to your employer, your HR or People team, or any other person within your organisation. This is fundamental to how coaching works. You will only be open and honest if you know the conversation is yours.</p>
              <p>Your personal notes, anything you write in the My Notes section of the platform, are stored securely in our database and are private to you. They are never visible to your organisation, your HR or People team, or any other participant. Only you can read, edit, or delete your notes.</p>
              <p>Mindset Quotient® staff do not read individual coaching conversations or personal notes except where strictly necessary for technical operations (for example, investigating a reported error). Access in these circumstances is logged and restricted to authorised personnel.</p>
              <p>Your individual MQ assessment scores are also private and are not shared with your employer without your explicit consent.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* AI coaching and your privacy */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>4. AI coaching and your privacy</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>Your coaching is powered by Anthropic&apos;s Claude AI. Here is exactly how your data is handled:</p>
              <p><span className="font-medium">Your data is never used to train AI models.</span> Anthropic&apos;s API terms explicitly prohibit the use of customer data for model training. Your conversations, scores, and personal information are never used to improve or fine-tune any AI system.</p>
              <p><span className="font-medium">Zero data retention by the AI provider.</span> When you send a message to your coach, it is processed via a real-time API call. Anthropic does not permanently store the content of these requests. Your data exists only in our own secure database.</p>
              <p><span className="font-medium">Temporary safety logs.</span> For trust and safety purposes, Anthropic may retain temporary logs of API requests for up to 30 days. These logs are used solely for abuse detection and are automatically deleted. They are never used for training or shared with third parties.</p>
              <p><span className="font-medium">Your data stays yours.</span> Your coaching conversations, assessment scores, and personal notes are only used to provide your personalised coaching experience. Nothing is shared, sold, or repurposed.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* What your organisation can see */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>5. What your organisation can see</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>Organisations that commission MQ programmes receive a cohort-level reporting dashboard. This shows:</p>
              <p style={{ paddingLeft: '1rem' }}>· Average and distribution of MQ scores across the cohort as a whole<br />· Engagement metrics, for example, what percentage of participants have completed the assessment or logged in<br />· Aggregate thematic patterns, where the data permits</p>
              <p>This reporting is always aggregated. Your organisation cannot use it to identify your individual scores, session content, or responses. Individual-level data is never included in organisational reporting.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Data sharing and third-party processors */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>6. Data sharing and third-party processors</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We never sell your personal data. We use the following third-party services to operate the platform. Each is subject to a Data Processing Agreement and processes data only on our behalf and in accordance with our instructions.</p>
              <p><span className="font-medium">Anthropic (Claude AI).</span> Your coaching messages are processed by Anthropic&apos;s Claude AI to generate coaching responses. Anthropic does not use this data for model training. Data transfers to the US are covered by appropriate safeguards under UK GDPR. Anthropic maintains SOC 2 Type II certification.</p>
              <p><span className="font-medium">Supabase (database).</span> We use Supabase to store your account data, assessment scores, coaching conversation history, notes, and values ratings. Data is stored on EU-based servers. Supabase maintains SOC 2 Type II certification.</p>
              <p><span className="font-medium">Resend (email).</span> We use Resend to deliver transactional emails such as account invitations, reminders, and nudges. Email content is not stored beyond delivery confirmation.</p>
              <p><span className="font-medium">Vercel (hosting).</span> Our platform is hosted on Vercel&apos;s infrastructure. Vercel processes limited technical data (such as IP addresses and request logs) as part of serving the application. Vercel maintains SOC 2 Type II certification.</p>
              <p>A Data Processing Agreement is available on request for enterprise customers.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Data security */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>7. Data security</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We take appropriate technical and organisational measures to protect your personal data. These include:</p>
              <p><span className="font-medium">Encryption in transit.</span> All data sent between your browser and our servers is encrypted using TLS (HTTPS), enforced at the infrastructure level.</p>
              <p><span className="font-medium">Encryption at rest.</span> All data stored in our database is encrypted using AES-256 encryption, managed by Supabase.</p>
              <p><span className="font-medium">Row-level security.</span> Database-level access controls ensure that each user can only access their own data. This is enforced at the database layer, not just the application layer.</p>
              <p><span className="font-medium">Secure authentication.</span> Passwords are hashed using bcrypt. We never store passwords in plain text. Session tokens are securely managed and regularly rotated.</p>
              <p>No system is completely secure, but we continuously review and improve our security practices.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Data retention */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>8. How long we keep your data</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We retain your data for as long as your account is active and for a reasonable period afterwards to comply with legal obligations. Specifically:</p>
              <p style={{ paddingLeft: '1rem' }}>· Account and profile data: retained while your account is active, then deleted within 12 months of account closure unless we are required to retain it longer by law.<br />· Assessment scores, coaching conversations, and personal notes: retained for the duration of your programme and for up to 12 months after its conclusion.<br />· Anonymised and aggregated usage data: may be retained indefinitely for product improvement purposes.</p>
              <p>You can request deletion of your data at any time by contacting us at{' '}
                <a href="mailto:privacy@mindsetquotient.com" className="underline" style={{ color: '#05A88E' }}>
                  privacy@mindsetquotient.com
                </a>. We will process deletion requests within 30 days.
              </p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* AI transparency and compliance */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>9. AI transparency and compliance</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We believe in being transparent about how AI is used in coaching. Here is what MQ does and does not do:</p>
              <p><span className="font-medium">No workplace monitoring.</span> MQ is a self-directed coaching platform. It does not monitor your work, track your productivity, or report on your behaviour to your employer.</p>
              <p><span className="font-medium">No automated decision-making.</span> Your MQ scores and coaching insights are for your personal development only. They are never used to make or inform employment decisions, performance reviews, promotions, or disciplinary actions.</p>
              <p><span className="font-medium">No emotion recognition for evaluation.</span> While your coach may discuss emotions as part of coaching, we do not use AI to detect, classify, or evaluate your emotional state for any purpose beyond the coaching conversation itself.</p>
              <p><span className="font-medium">EU AI Act compliance.</span> Our use of AI in coaching is designed to comply with the EU AI Act. MQ does not engage in social scoring, behaviour manipulation, or any prohibited AI practice as defined by the regulation.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Your rights */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>10. Your rights under UK GDPR</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>Under UK GDPR, you have the following rights:</p>
              <p style={{ paddingLeft: '1rem' }}>
                · <span className="font-medium">Access.</span> You can request a copy of the personal data we hold about you.<br /><br />
                · <span className="font-medium">Rectification.</span> You can ask us to correct inaccurate or incomplete data.<br /><br />
                · <span className="font-medium">Erasure.</span> You can ask us to delete your personal data, subject to any legal obligations we have to retain it.<br /><br />
                · <span className="font-medium">Restriction.</span> You can ask us to restrict how we process your data in certain circumstances.<br /><br />
                · <span className="font-medium">Portability.</span> You can request a copy of your data in a structured, machine-readable format.<br /><br />
                · <span className="font-medium">Objection.</span> You can object to processing based on our legitimate interests.
              </p>
              <p>To exercise any of these rights, contact us at{' '}
                <a href="mailto:privacy@mindsetquotient.com" className="underline" style={{ color: '#05A88E' }}>
                  privacy@mindsetquotient.com
                </a>. We will respond within one calendar month. If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#05A88E' }}>
                  ico.org.uk
                </a>.
              </p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Cookies */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>11. Cookies</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We use only essential cookies that are necessary for the platform to function. These include:</p>
              <p style={{ paddingLeft: '1rem' }}>· Authentication cookies to keep you signed in<br />· Session cookies to maintain your coaching session state</p>
              <p>We do not use advertising cookies, third-party tracking cookies, or analytics cookies that track your behaviour across other websites.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Changes */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>12. Changes to this policy</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              We may update this policy from time to time. If we make material changes, we will notify you by email or by a notice within the platform before the changes take effect. The date at the top of this page reflects when the policy was last updated.
            </p>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Contact */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>13. Contact us</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              If you have any questions about this policy or how we handle your personal data, please contact us at{' '}
              <a href="mailto:privacy@mindsetquotient.com" className="underline" style={{ color: '#05A88E' }}>
                privacy@mindsetquotient.com
              </a>.
            </p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-10">
        <p className="text-xs" style={{ color: '#9CA3AF' }}>© {new Date().getFullYear()} Mindset Quotient®. All rights reserved.</p>
      </div>

    </main>
  )
}
