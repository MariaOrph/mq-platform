// ── .ics calendar invite generator ─────────────────────────────────────────────

import { SLOT_DURATION_MINUTES } from './slots'

/** Format a Date as a UTC iCal timestamp: 20260508T083000Z */
function toICalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

/** Escape special characters per RFC 5545. */
function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export interface IcsBookingArgs {
  uid:           string  // unique id (booking id)
  startUTC:      Date
  attendeeEmail: string
  attendeeName:  string
  organizerEmail:string
  organizerName: string
  description:   string
  cancelUrl:     string
  /**
   * Bumped when the event is updated (e.g. rescheduled). Per RFC 5545 the
   * sequence must increase for calendar clients to apply the update.
   * Defaults to 0 for new bookings.
   */
  sequence?:     number
}

export function buildBookingIcs(args: IcsBookingArgs): string {
  const start = args.startUTC
  const end   = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60 * 1000)

  const summary  = 'Discovery call — Manager Mindset Accelerator'
  const location = 'Online (we will send a video link before the call)'

  const desc = [
    args.description,
    '',
    `Cancel or reschedule: ${args.cancelUrl}`,
  ].filter(Boolean).join('\n')

  // CRLF line endings per RFC 5545.
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mindset Quotient//Discovery Call//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${args.uid}@mindsetquo.com`,
    `DTSTAMP:${toICalDate(new Date())}`,
    `DTSTART:${toICalDate(start)}`,
    `DTEND:${toICalDate(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(desc)}`,
    `LOCATION:${escapeText(location)}`,
    `ORGANIZER;CN=${escapeText(args.organizerName)}:mailto:${args.organizerEmail}`,
    `ATTENDEE;CN=${escapeText(args.attendeeName)};RSVP=TRUE:mailto:${args.attendeeEmail}`,
    'STATUS:CONFIRMED',
    `SEQUENCE:${args.sequence ?? 0}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

/**
 * Build a METHOD:CANCEL ics so calendar clients remove the event automatically
 * when the host cancels (or when a booking is being rescheduled and we want
 * to clear the original slot from the booker's calendar).
 */
export interface IcsCancelArgs {
  uid:            string
  startUTC:       Date
  attendeeEmail:  string
  attendeeName:   string
  organizerEmail: string
  organizerName:  string
  /** Must be greater than the previous sequence the client received. */
  sequence:       number
}

export function buildBookingCancelIcs(args: IcsCancelArgs): string {
  const start = args.startUTC
  const end   = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60 * 1000)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mindset Quotient//Discovery Call//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${args.uid}@mindsetquo.com`,
    `DTSTAMP:${toICalDate(new Date())}`,
    `DTSTART:${toICalDate(start)}`,
    `DTEND:${toICalDate(end)}`,
    'SUMMARY:Discovery call — Manager Mindset Accelerator (cancelled)',
    `ORGANIZER;CN=${escapeText(args.organizerName)}:mailto:${args.organizerEmail}`,
    `ATTENDEE;CN=${escapeText(args.attendeeName)};RSVP=FALSE:mailto:${args.attendeeEmail}`,
    'STATUS:CANCELLED',
    `SEQUENCE:${args.sequence}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}
