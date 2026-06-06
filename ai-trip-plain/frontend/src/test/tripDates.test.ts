import { describe, expect, it } from 'vitest'
import { addDaysToDateInput, formatTripDate, getInclusiveDayCount } from '../lib/tripDates'

describe('trip date helpers', () => {
  it('counts both the start and end date', () => {
    expect(getInclusiveDayCount('2026-06-10', '2026-06-15')).toBe(6)
  })

  it('formats dates without shifting the selected calendar day', () => {
    expect(formatTripDate('2026-06-10')).toBe('10 June 2026')
  })

  it('generates dates that align with day-wise itinerary entries', () => {
    expect(addDaysToDateInput('2026-06-10', 5)).toBe('2026-06-15')
  })
})
