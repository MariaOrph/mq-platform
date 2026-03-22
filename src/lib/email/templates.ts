// ── Shared email layout ────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MQ — Mindset Quotient</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block;text-align:center;">
                <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#05A88E;">MQ</span><br/>
                <span style="font-size:11px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Mindset Quotient</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                <a href="https://mindsetquo.com" style="color:#9ca3af;text-decoration:none;">mindsetquo.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Invitation email ───────────────────────────────────────────────────────────

export function inviteEmailHtml({
  firstName,
  inviteUrl,
}: {
  firstName:   string | null
  cohortName:  string
  companyName: string
  inviteUrl:   string
}): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'

  return layout(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      You've been invited to your MQ journey
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${greeting}</p>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">
      MQ is built on a simple belief: the managers and leaders who make a lasting difference
      aren't just skilled — they have the right mindset. The ability to lead themselves first.
      To stay clear and grounded under pressure. To bring out the best in the people around them.
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.7;">
      That's what we're here to build with you.
    </p>

    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0A2E2A;">Here's how it works:</p>

    <!-- Step 1 -->
    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#05A88E;">Step 1 — Get your MQ profile</p>
    <p style="margin:0 0 16px;font-size:14px;color:#444444;line-height:1.7;">
      Start with the MQ Assessment — around 15 minutes — and get a personalised score across
      the 7 dimensions of mindset intelligence behind effective people managers and leaders.
      This is your baseline. You can also invite colleagues to complete a short 360 survey,
      so you can see how others perceive you against how you see yourself.
    </p>

    <!-- Step 2 -->
    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#05A88E;">Step 2 — Start building</p>
    <p style="margin:0 0 8px;font-size:14px;color:#444444;line-height:1.7;">
      Get daily challenges targeted at your biggest development areas, delivered straight to
      your dashboard. And when you're ready to go deeper, your three coaching zones are
      waiting — open 24/7 and always confidential:
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">
          <strong style="color:#0A2E2A;">The Coaching Room</strong> — discuss any challenge or situation you're facing
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">
          <strong style="color:#0A2E2A;">MQ Gym</strong> — build the mental muscles behind all 7 MQ dimensions and explore the science and psychology behind them
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">
          <strong style="color:#0A2E2A;">Culture Lab</strong> — strengthen the skills and mindset needed to build a happy, high-performing team culture
        </td>
      </tr>
    </table>

    <!-- Step 3 -->
    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#05A88E;">Step 3 — Track your growth</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.7;">
      Reassess over time to see how your scores shift — and more importantly, notice how you
      show up differently when it counts.
    </p>

    <p style="margin:0 0 24px;font-size:15px;font-weight:600;color:#0A2E2A;line-height:1.6;">
      The leaders who make the biggest impact never stop learning. Your next growth chapter starts here!
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="border-radius:10px;background-color:#05A88E;">
          <a href="${inviteUrl}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
            Begin your MQ Assessment →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px;font-size:15px;color:#444444;line-height:1.7;">
      We look forward to supporting you in your journey,
    </p>
    <p style="margin:0;font-size:15px;font-weight:700;color:#0A2E2A;">
      Maria &amp; Richard<br/>
      <span style="font-weight:400;color:#05A88E;">MQ</span>
    </p>
  `)
}

export function inviteEmailText({
  firstName,
  inviteUrl,
}: {
  firstName:   string | null
  cohortName:  string
  companyName: string
  inviteUrl:   string
}): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
  return `${greeting}

You've been invited to your MQ journey.

MQ is built on a simple belief: the managers and leaders who make a lasting difference aren't just skilled — they have the right mindset. The ability to lead themselves first. To stay clear and grounded under pressure. To bring out the best in the people around them.

That's what we're here to build with you.

Here's how it works:

Step 1 — Get your MQ profile
Start with the MQ Assessment — around 15 minutes — and get a personalised score across the 7 dimensions of mindset intelligence behind effective people managers and leaders. This is your baseline. You can also invite colleagues to complete a short 360 survey, so you can see how others perceive you against how you see yourself.

Step 2 — Start building
Get daily challenges targeted at your biggest development areas, delivered straight to your dashboard. And when you're ready to go deeper, your three coaching zones are waiting — open 24/7 and always confidential:

- The Coaching Room — discuss any challenge or situation you're facing
- MQ Gym — build the mental muscles behind all 7 MQ dimensions and explore the science and psychology behind them
- Culture Lab — strengthen the skills and mindset needed to build a happy, high-performing team culture

Step 3 — Track your growth
Reassess over time to see how your scores shift — and more importantly, notice how you show up differently when it counts.

The leaders who make the biggest impact never stop learning. Your next growth chapter starts here!

Begin your MQ Assessment: ${inviteUrl}

We look forward to supporting you in your journey,
Maria & Richard
MQ

mindsetquo.com`
}

// ── Daily reminder email ───────────────────────────────────────────────────────

const DIMENSION_ONE_LINERS: Record<string, string> = {
  'Self-awareness':        'The foundation of everything — the more you notice your own patterns, the more choice you have in how you show up.',
  'Ego & identity':        'Leading from your values, not your ego — the shift that unlocks real authority and lasting trust.',
  'Emotional regulation':  'Learning to notice your triggers and choose your response — the skill that transforms difficult conversations.',
  'Cognitive flexibility': 'Your ability to reframe, adapt and stay open — even when it\'s uncomfortable.',
  'Values & purpose':      'Getting clear on what you stand for and where you\'re going — so your leadership becomes consistent, trustworthy and intentional.',
  'Relational mindset':    'Moving from doing to enabling — so your impact works through your people, not just through you.',
  'Adaptive resilience':   'Staying grounded when the pressure is on — so your team takes their cues from your calm, not your stress.',
}

const SUBJECT_LINES = [
  (name: string) => `Your coaching moment is ready, ${name}`,
  (name: string) => `5 minutes for your leadership today, ${name}`,
  (name: string) => `Your MQ moment is waiting, ${name}`,
  (name: string) => `A coaching moment for you today, ${name}`,
]

export function reminderSubjectLine(firstName: string, seed: number): string {
  return SUBJECT_LINES[seed % SUBJECT_LINES.length](firstName)
}

export function reminderEmailHtml({
  firstName,
  dimensionName,
  dashboardUrl,
  unsubscribeUrl,
}: {
  firstName:      string
  dimensionName:  string
  dashboardUrl:   string
  unsubscribeUrl: string
}): string {
  const oneLiner = DIMENSION_ONE_LINERS[dimensionName] ?? 'Developing your mindset intelligence so you can lead with more intention every day.'

  return layout(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      Your coaching moment is ready, ${firstName}.
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">
      Today's focus is <strong style="color:#0A2E2A;">${dimensionName}</strong> —
      ${oneLiner}
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.7;">
      Your session is personalised to your MQ profile and takes just 5–10 minutes. Take a moment for yourself today.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="border-radius:10px;background-color:#05A88E;">
          <a href="${dashboardUrl}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
            Open my coaching moment →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px;font-size:15px;color:#444444;line-height:1.7;">
      See you in there,
    </p>
    <p style="margin:0 0 32px;font-size:15px;font-weight:700;color:#0A2E2A;">
      Maria &amp; Richard<br/>
      <span style="font-weight:400;color:#05A88E;">MQ</span>
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />
    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
      <a href="https://mindsetquo.com" style="color:#9ca3af;text-decoration:none;">mindsetquo.com</a>
      &nbsp;·&nbsp;
      <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:none;">Unsubscribe from daily reminders</a>
    </p>
  `)
}

export function reminderEmailText({
  firstName,
  dimensionName,
  dashboardUrl,
  unsubscribeUrl,
}: {
  firstName:      string
  dimensionName:  string
  dashboardUrl:   string
  unsubscribeUrl: string
}): string {
  const oneLiner = DIMENSION_ONE_LINERS[dimensionName] ?? ''
  return `Hi ${firstName},

Today's focus is ${dimensionName} — ${oneLiner}

Your session is personalised to your MQ profile and takes just 5–10 minutes. Take a moment for yourself today.

Open my coaching moment: ${dashboardUrl}

See you in there,
Maria & Richard
MQ

---
mindsetquo.com
Unsubscribe from daily reminders: ${unsubscribeUrl}`
}

// ── 360 feedback invite email ──────────────────────────────────────────────────

export function feedbackInviteHtml({
  participantFirstName,
  respondentName,
  surveyUrl,
}: {
  participantFirstName: string
  respondentName:       string | null
  surveyUrl:            string
}): string {
  const greeting = respondentName ? `Hi ${respondentName},` : 'Hi there,'
  return layout(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      ${participantFirstName} has asked for your feedback
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${greeting}</p>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">
      <strong style="color:#0A2E2A;">${participantFirstName}</strong> is working on their leadership development
      through MQ and has asked for your honest perspective on how they show up as a leader.
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.7;">
      The survey takes around <strong style="color:#0A2E2A;">5 minutes</strong>. Your responses are
      completely anonymous — ${participantFirstName} will only ever see aggregated results, never
      individual responses.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="border-radius:10px;background-color:#05A88E;">
          <a href="${surveyUrl}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
            Give feedback →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;line-height:1.6;">
      No account or login needed — just click the button above. This link is unique to you.
    </p>
  `)
}

export function feedbackInviteText({
  participantFirstName,
  respondentName,
  surveyUrl,
}: {
  participantFirstName: string
  respondentName:       string | null
  surveyUrl:            string
}): string {
  const greeting = respondentName ? `Hi ${respondentName},` : 'Hi there,'
  return `${greeting}

${participantFirstName} has asked for your feedback.

${participantFirstName} is working on their leadership development through MQ and has asked for your honest perspective on how they show up as a leader.

The survey takes around 5 minutes. Your responses are completely anonymous — ${participantFirstName} will only ever see aggregated results, never individual responses.

Give feedback: ${surveyUrl}

This link is unique to you. If you've already submitted, you don't need to do anything else.

mindsetquo.com`
}
