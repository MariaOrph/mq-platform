export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <a href="/dashboard" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'rgba(185,248,221,0.6)' }}>
            ← Back to dashboard
          </a>
          <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>Privacy Policy</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(185,248,221,0.6)' }}>
            Mindset Quotient® Ltd &nbsp;·&nbsp; Last updated: March 2026
          </p>
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
              <p><span className="font-medium">Account and profile data.</span> Your name, email address, and professional role — provided when you are invited to the platform or create an account.</p>
              <p><span className="font-medium">MQ Assessment responses and scores.</span> Your answers to the MQ assessment questionnaire and the resulting dimension scores. These are used to personalise your coaching experience.</p>
              <p><span className="font-medium">Coaching conversation content.</span> The messages you exchange with your AI coach in the coaching room. These are stored to maintain continuity within and across sessions.</p>
              <p><span className="font-medium">Values ratings.</span> If your organisation has set up a Values in Action check-in, your self-ratings against company values and behaviours are stored and used to personalise coaching.</p>
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
              <p><span className="font-medium">To improve the platform.</span> We may use anonymised and aggregated data to analyse patterns, improve coaching quality, and develop new features. This data cannot be used to identify you individually.</p>
              <p>Our legal basis for processing is primarily the performance of a contract (providing you with the platform) and legitimate interests (improving the platform in a way that does not override your rights).</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Confidentiality of coaching conversations */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>3. Confidentiality of your coaching conversations and personal notes</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>Your coaching conversations are private. They are not accessible to your employer, your HR or People team, or any other person within your organisation. This is fundamental to how coaching works — you will only be open and honest if you know the conversation is yours.</p>
              <p>Your personal notes — anything you write in the My Notes section of the platform — are stored securely in our database and are private to you. They are never visible to your organisation, your HR or People team, or any other participant. Only you can read, edit, or delete your notes.</p>
              <p>Mindset Quotient® staff do not read individual coaching conversations or personal notes except where strictly necessary for technical operations (for example, investigating a reported error). Access in these circumstances is logged and restricted to authorised personnel.</p>
              <p>Your individual MQ assessment scores are also private and are not shared with your employer without your explicit consent.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* What your organisation can see */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>4. What your organisation can see</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>Organisations that commission MQ programmes receive a cohort-level reporting dashboard. This shows:</p>
              <p style={{ paddingLeft: '1rem' }}>· Average and distribution of MQ scores across the cohort as a whole<br />· Engagement metrics — for example, what percentage of participants have completed the assessment or logged in<br />· Aggregate thematic patterns, where the data permits</p>
              <p>This reporting is always aggregated. Your organisation cannot use it to identify your individual scores, session content, or responses. Individual-level data is never included in organisational reporting.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Third-party processors */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>5. Third-party processors</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We use the following third-party services to operate the platform. Each is subject to a Data Processing Agreement and processes data only on our behalf and in accordance with our instructions.</p>
              <p><span className="font-medium">Anthropic (Claude AI).</span> Your coaching messages are processed by Anthropic&apos;s Claude AI model to generate coaching responses. Anthropic processes this data under our instructions and does not use it to train its models by default. Anthropic is a US-based company; data transfers are covered by appropriate safeguards under UK GDPR.</p>
              <p><span className="font-medium">Supabase.</span> We use Supabase to store your account data, assessment scores, coaching conversation history, and values ratings. Data is stored in EU-based servers.</p>
              <p><span className="font-medium">Vercel.</span> Our platform is hosted on Vercel&apos;s infrastructure. Vercel processes limited technical data (such as IP addresses and request logs) as part of serving the application.</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Data retention */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>6. How long we keep your data</h2>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>We retain your data for as long as your account is active and for a reasonable period afterwards to comply with legal obligations. Specifically:</p>
              <p style={{ paddingLeft: '1rem' }}>· Account and profile data: retained while your account is active, then deleted within 12 months of account closure unless we are required to retain it longer by law.<br />· Assessment scores, coaching conversations, and personal notes: retained for the duration of your programme and for up to 12 months after its conclusion.<br />· Anonymised and aggregated usage data: may be retained indefinitely for product improvement purposes.</p>
              <p>You can request deletion of your data at any time by contacting us (see section 8).</p>
            </div>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Security */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>7. Security</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              We take appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. These include encrypted data storage, access controls, and secure authentication. No system is completely secure, but we continuously review and improve our security practices.
            </p>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Your rights */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>8. Your rights under UK GDPR</h2>
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

          {/* Changes */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>9. Changes to this policy</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              We may update this policy from time to time. If we make material changes, we will notify you by email or by a notice within the platform before the changes take effect. The date at the top of this page reflects when the policy was last updated.
            </p>
          </section>

          <hr style={{ borderColor: '#F3F4F6' }} />

          {/* Contact */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0A2E2A' }}>10. Contact us</h2>
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
