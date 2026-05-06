// ── Booking email templates ────────────────────────────────────────────────────
// Confirmation to booker + internal notification to Maria & Richard.

function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MQ — Mindset Quotient®</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#05A88E;">MQ</span><br/>
              <span style="font-size:11px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Mindset Quotient®</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
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

interface ConfirmationArgs {
  firstName:  string
  dateLabel:  string  // "Friday 8 May 2026"
  timeLabel:  string  // "09:30"
  cancelUrl:  string
  topic:      string | null
}

export function bookingConfirmationHtml(args: ConfirmationArgs): string {
  const greeting = args.firstName ? `Hi ${args.firstName},` : 'Hi there,'
  const topicBlock = args.topic
    ? `<tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">What you wanted to discuss</td></tr>
       <tr><td style="padding:0 0 16px;font-size:15px;color:#0A2E2A;font-weight:500;">${escapeHtml(args.topic)}</td></tr>`
    : ''

  return shell(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      Your call is booked
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${greeting}</p>

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.7;">
      Thanks for booking a discovery call with us. We're looking forward to hearing what you're working on. A calendar invite is attached to this email — accept it to add the call to your calendar.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4FDF9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">When</td></tr>
      <tr><td style="padding:0 0 16px;font-size:17px;color:#0A2E2A;font-weight:700;">${args.dateLabel}<br/>${args.timeLabel} UK time (30 minutes)</td></tr>
      ${topicBlock}
    </table>

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.7;">
      We'll send a video-call link the day before. If anything changes on your end, you can cancel using the button below and we'll free the slot back up.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <a href="${args.cancelUrl}" style="display:inline-block;padding:12px 22px;background-color:#ffffff;color:#0A2E2A;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;border:1px solid #d1d5db;">
            Cancel this call
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
      Speak soon,<br/>
      <strong style="color:#0A2E2A;">Maria & Richard</strong>
    </p>
  `)
}

interface NotificationArgs {
  name:        string
  email:       string
  company:     string | null
  jobRole:     string | null
  phone:       string | null
  topic:       string | null
  dateLabel:   string
  timeLabel:   string
  cancelUrl:   string
}

export function bookingNotificationHtml(args: NotificationArgs): string {
  const row = (label: string, value: string | null) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;vertical-align:top;width:120px;">${label}</td>
         <td style="padding:6px 0;font-size:14px;color:#0A2E2A;">${escapeHtml(value)}</td></tr>`
      : ''

  return shell(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      New discovery call booked
    </h1>

    <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.7;">
      <strong>${escapeHtml(args.dateLabel)}</strong> at <strong>${args.timeLabel}</strong> UK time.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4FDF9;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${row('Name',    args.name)}
      ${row('Email',   args.email)}
      ${row('Company', args.company)}
      ${row('Role',    args.jobRole)}
      ${row('Phone',   args.phone)}
      ${row('Topic',   args.topic)}
    </table>

    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.7;">
      Cancel link (only use if needed): <a href="${args.cancelUrl}" style="color:#05A88E;">cancel</a>
    </p>
  `)
}

/* ── Admin-initiated cancellation ───────────────────────────────────────────── */
interface CancelledByHostArgs {
  firstName: string
  dateLabel: string
  timeLabel: string
  rebookUrl: string  // /book-a-call so they can pick a new slot
  note?:     string  // optional personal note from Maria/Richard
}

export function bookingCancelledByHostHtml(args: CancelledByHostArgs): string {
  const greeting = args.firstName ? `Hi ${args.firstName},` : 'Hi there,'
  const noteBlock = args.note
    ? `<p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${escapeHtml(args.note)}</p>`
    : ''
  return shell(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      We need to cancel your discovery call
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${greeting}</p>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">
      Apologies — we have to cancel your discovery call on <strong>${args.dateLabel}</strong> at <strong>${args.timeLabel}</strong> UK time. The slot has been freed up.
    </p>

    ${noteBlock}

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.7;">
      We'd still love to speak. Please pick a new time that works for you:
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <a href="${args.rebookUrl}" style="display:inline-block;padding:14px 26px;background-color:#05A88E;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px;">
            Pick a new time
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
      Apologies again,<br/>
      <strong style="color:#0A2E2A;">Maria & Richard</strong>
    </p>
  `)
}

/* ── Admin-initiated reschedule ─────────────────────────────────────────────── */
interface RescheduledArgs {
  firstName:    string
  oldDateLabel: string
  oldTimeLabel: string
  newDateLabel: string
  newTimeLabel: string
  cancelUrl:    string  // refreshed cancel link if the user wants to drop the new slot
  note?:        string
}

export function bookingRescheduledHtml(args: RescheduledArgs): string {
  const greeting = args.firstName ? `Hi ${args.firstName},` : 'Hi there,'
  const noteBlock = args.note
    ? `<p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${escapeHtml(args.note)}</p>`
    : ''
  return shell(`
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0A2E2A;line-height:1.3;">
      Your discovery call has moved
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">${greeting}</p>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">
      We've moved your call from <strong>${args.oldDateLabel}, ${args.oldTimeLabel}</strong> to a new time. A fresh calendar invite is attached — accept it to update your calendar.
    </p>

    ${noteBlock}

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4FDF9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">New time</td></tr>
      <tr><td style="padding:0;font-size:17px;color:#0A2E2A;font-weight:700;">${args.newDateLabel}<br/>${args.newTimeLabel} UK time (30 minutes)</td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.7;">
      If the new time doesn't work for you, you can cancel below and pick another slot.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <a href="${args.cancelUrl}" style="display:inline-block;padding:12px 22px;background-color:#ffffff;color:#0A2E2A;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;border:1px solid #d1d5db;">
            Cancel this call
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
      Speak soon,<br/>
      <strong style="color:#0A2E2A;">Maria & Richard</strong>
    </p>
  `)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
