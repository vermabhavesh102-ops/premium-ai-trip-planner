const DAY_MS = 24 * 60 * 60 * 1000

export function parseDateInput(value?: string | null) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function formatTripDate(value?: string | null) {
  const date = parseDateInput(value)
  if (!date) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getInclusiveDayCount(startDate?: string | null, endDate?: string | null) {
  const start = parseDateInput(startDate)
  const end = parseDateInput(endDate)
  if (!start || !end || end < start) return null
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1
}

export function addDaysToDateInput(value: string, days: number) {
  const date = parseDateInput(value)
  if (!date) return ''
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
