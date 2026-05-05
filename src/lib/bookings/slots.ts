// ── Slot generation for discovery-call bookings ────────────────────────────────
// Slots are Friday mornings 9:00–11:30 UK time (Europe/London) in 30-minute
// increments — six slots per Friday: 9:00, 9:30, 10:00, 10:30, 11:00, 11:30.
// All times are persisted and exchanged as UTC ISO strings.

const LONDON_TZ = 'Europe/London'

/** Slot times (UK wall-clock, hour and minute). 9:00 → 11:30 in 30-min steps. */
export const SLOT_TIMES: Array<{ hour: number; minute: number }> = [
  { hour: 9,  minute: 0 },
  { hour: 9,  minute: 30 },
  { hour: 10, minute: 0 },
  { hour: 10, minute: 30 },
  { hour: 11, minute: 0 },
  { hour: 11, minute: 30 },
]

/** How many Fridays ahead we offer. */
export const WEEKS_AHEAD = 8

/** Slot duration in minutes (used by .ics + UI). */
export const SLOT_DURATION_MINUTES = 30

/**
 * Convert a Europe/London wall-clock time to a UTC Date.
 * Handles BST/GMT automatically using Intl.DateTimeFormat.
 */
export function londonWallClockToUTC(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
): Date {
  // Treat the wall-clock as if it were UTC, then ask what that instant looks
  // like in London. The difference tells us the BST/GMT offset to apply.
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(naive).map((p) => [p.type, p.value]),
  )
  const londonHour = Number(parts.hour)
  // If London shows 10 when our naive UTC is 9, offset is +1, so real UTC = 8.
  const offsetHours = londonHour - hour
  return new Date(Date.UTC(year, month - 1, day, hour - offsetHours, minute))
}

/** Returns the Y/M/D in Europe/London for a given Date. */
function londonYMD(d: Date): { year: number; month: number; day: number; weekday: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  )
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  return {
    year:    Number(parts.year),
    month:   Number(parts.month),
    day:     Number(parts.day),
    weekday: weekdayMap[parts.weekday as string] ?? 0,
  }
}

/**
 * Generate all upcoming Friday slot timestamps (as UTC Dates), starting from
 * the next future slot. Excludes any slots that have already started.
 */
export function generateUpcomingSlots(now: Date = new Date()): Date[] {
  const today = londonYMD(now)
  // Days until next Friday (London-local). If today is Friday, daysAhead = 0.
  const daysToFri = (5 - today.weekday + 7) % 7

  const slots: Date[] = []
  for (let week = 0; week < WEEKS_AHEAD; week++) {
    // Compute the date of this Friday in London time.
    const baseUTC = londonWallClockToUTC(today.year, today.month, today.day, 12, 0)
    const fridayUTC = new Date(baseUTC.getTime() + (daysToFri + week * 7) * 24 * 60 * 60 * 1000)
    const fridayLondon = londonYMD(fridayUTC)

    for (const { hour, minute } of SLOT_TIMES) {
      const slot = londonWallClockToUTC(
        fridayLondon.year,
        fridayLondon.month,
        fridayLondon.day,
        hour,
        minute,
      )
      if (slot.getTime() > now.getTime()) slots.push(slot)
    }
  }
  return slots
}

/** Format a slot's UTC instant as a UK-friendly long string, e.g. "Fri 8 May, 09:30". */
export function formatSlotLabel(slot: Date): string {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  // "Fri, 8 May, 09:30" → tidy commas
  return fmt.format(slot).replace(/,\s/g, ' ').trim()
}

/** Just the time portion in UK time, e.g. "09:30". */
export function formatSlotTime(slot: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(slot)
}

/** Date portion in UK time, e.g. "Friday 8 May 2026". */
export function formatSlotDate(slot: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(slot)
}
