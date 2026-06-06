export type StoredTrip = {
  id?: string
  itinerary_id?: string
  destination?: string
  source?: string
  duration_days?: number
  travelers?: number
  maps_embed_url?: string
  savedAt?: string
  planner_meta?: {
    destination?: { name?: string; region?: string; country?: string } | null
    budget?: string
    interests?: string[]
    transportPref?: string
    hotelPref?: string
    aiChips?: string[]
  }
}

export const createTripId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const readSavedTrips = <T extends StoredTrip = StoredTrip>() => {
  try {
    const trips = JSON.parse(localStorage.getItem('saved_trips') ?? '[]') as T[]
    let hasUpdates = false

    const tripsWithIds = trips.map((trip) => {
      if (trip.id) return trip

      hasUpdates = true
      return { ...trip, id: createTripId() }
    }) as T[]

    if (hasUpdates) {
      localStorage.setItem('saved_trips', JSON.stringify(tripsWithIds))
    }

    return tripsWithIds
  } catch {
    return [] as T[]
  }
}

export const findSavedTrip = <T extends StoredTrip = StoredTrip>(tripId?: string) => {
  if (!tripId) return null

  return readSavedTrips<T>().find((trip) => trip.id === tripId) ?? null
}

export const upsertSavedTrip = <T extends StoredTrip>(trip: T) => {
  const tripWithId = { ...trip, id: trip.id ?? createTripId(), savedAt: trip.savedAt ?? new Date().toISOString() }
  const savedTrips = readSavedTrips<T>()
  const existingIndex = savedTrips.findIndex((savedTrip) => savedTrip.id === tripWithId.id)

  const nextTrips =
    existingIndex >= 0
      ? savedTrips.map((savedTrip) => (savedTrip.id === tripWithId.id ? tripWithId : savedTrip))
      : [tripWithId, ...savedTrips]

  localStorage.setItem('saved_trips', JSON.stringify(nextTrips))
  return tripWithId
}
