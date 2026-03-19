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
  cohortName,
  companyName,
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
      MQ (Mindset Quotient) is the ability to notice your thoughts, beliefs and emotional triggers
      and choose how you respond to them, rather than being unconsciously driven by them. Your MQ
      journey is a personalised development experience designed to help you lead yourself and others
      more intentionally.
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.7;">
      You've been invited to take the MQ Assessment as part of <strong style="color:#0A2E2A;">${cohortName}</strong>
      at <strong style="color:#0A2E2A;">${companyName}</strong>. It takes around 5 minutes and gives
      you a personalised MQ score and insights across 6 dimensions of mindset intelligence.
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
      Looking forward to your journey,
    </p>
    <p style="margin:0;font-size:15px;font-weight:700;color:#0A2E2A;">
      Maria &amp; Richard<br/>
      <span style="font-weight:400;color:#05A88E;">MQ</span>
    </p>
  `)
}

export function inviteEmailText({
  firstName,
  cohortName,
  companyName,
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

MQ (Mindset Quotient) is the ability to notice your thoughts, beliefs and emotional triggers and choose how you respond to them, rather than being unconsciously driven by them. Your MQ journey is a personalised development experience designed to help you lead yourself and others more intentionally.

You've been invited to take the MQ Assessment as part of ${cohortName} at ${companyName}. It takes around 5 minutes and gives you a personalised MQ score and insights across 6 dimensions of mindset intelligence.

Begin your MQ Assessment: ${inviteUrl}

Looking forward to your journey,
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
      This link is unique to you. If you've already submitted, you don't need to do anything else.
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
