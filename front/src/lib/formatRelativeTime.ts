const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_MONTH = 30
const MONTHS_PER_YEAR = 12

const MINUTE_IN_MS = SECONDS_PER_MINUTE * 1000
const HOUR_IN_MS = MINUTES_PER_HOUR * MINUTE_IN_MS
const DAY_IN_MS = HOURS_PER_DAY * HOUR_IN_MS
const MONTH_IN_MS = DAYS_PER_MONTH * DAY_IN_MS
const YEAR_IN_MS = MONTHS_PER_YEAR * MONTH_IN_MS

// Picks the coarsest unit that still reads as "recent enough" (e.g. 90 minutes reads
// better as "1 hour ago" than "90 minutes ago"), matching Intl.RelativeTimeFormat's own
// expectation of receiving an already-rounded value per unit.
function pickUnitAndValue(diffMs: number): { unit: Intl.RelativeTimeFormatUnit; value: number } {
  const absDiffMs = Math.abs(diffMs)

  if (absDiffMs < MINUTE_IN_MS) {
    return { unit: 'second', value: diffMs / 1000 }
  }
  if (absDiffMs < HOUR_IN_MS) {
    return { unit: 'minute', value: diffMs / MINUTE_IN_MS }
  }
  if (absDiffMs < DAY_IN_MS) {
    return { unit: 'hour', value: diffMs / HOUR_IN_MS }
  }
  if (absDiffMs < MONTH_IN_MS) {
    return { unit: 'day', value: diffMs / DAY_IN_MS }
  }
  if (absDiffMs < YEAR_IN_MS) {
    return { unit: 'month', value: diffMs / MONTH_IN_MS }
  }
  return { unit: 'year', value: diffMs / YEAR_IN_MS }
}

// Formats an ISO date into a localized relative-time string ("2 days ago" / "hace 2
// días"), using the platform-native Intl.RelativeTimeFormat: no date-formatting
// dependency needed, it already picks the right pluralization per locale.
export function formatRelativeTime(isoDate: string, language: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now()
  const { unit, value } = pickUnitAndValue(diffMs)

  const formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
  return formatter.format(Math.round(value), unit)
}
