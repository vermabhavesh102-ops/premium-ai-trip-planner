import { Link } from 'react-router-dom'
import { readSavedTrips } from '../lib/tripStorage'

type SavedTrip = {
  id?: string
  itinerary_id?: string
  destination?: string
  duration_days?: number
  travelers?: number
  savedAt?: string
  planner_meta?: {
    destination?: { name?: string }
    interests?: string[]
    budget?: string
  }
}

const formatDate = (value?: string) => {
  if (!value) return 'Recently'

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default function Dashboard() {
  const savedTrips = readSavedTrips<SavedTrip>()

  const destinations = new Set(
    savedTrips
      .map((trip) => trip.destination ?? trip.planner_meta?.destination?.name)
      .filter(Boolean),
  )
  const totalDays = savedTrips.reduce((sum, trip) => sum + (trip.duration_days ?? 0), 0)
  const interestCounts = savedTrips
    .flatMap((trip) => trip.planner_meta?.interests ?? [])
    .reduce<Record<string, number>>((counts, interest) => {
      counts[interest] = (counts[interest] ?? 0) + 1
      return counts
    }, {})
  const topInterest =
    Object.entries(interestCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const stats = [
    ['Trips planned', savedTrips.length],
    ['Total days', totalDays],
    ['Destinations', destinations.size],
    ['Top interest', topInterest],
  ]

  return (
    <div className="min-h-[calc(100vh-92px)] bg-[#f6f1ea] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-[#9a7650]">
          Dashboard
        </p>
        <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-bold leading-none tracking-normal sm:text-5xl">
          Travel at a glance
        </h1>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <article
              key={label}
              className="min-h-20 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-slate-500">
                {label}
              </p>
              <p className="mt-4 font-['Playfair_Display'] text-2xl font-bold leading-none">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-['Playfair_Display'] text-xl font-bold tracking-normal">
              Recent activity
            </h2>
            <Link
              to="/workspace"
                className="border-b border-[#d5b487] text-sm font-medium text-slate-800 transition hover:text-[#9a7650] dark:text-slate-200"
            >
              View all
            </Link>
          </div>

          {savedTrips.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              No activity yet.{' '}
              <Link to="/planner" className="border-b border-[#d5b487] text-slate-700 dark:text-slate-200">
                Plan a trip.
              </Link>
            </p>
          ) : (
            <div className="mt-5 divide-y divide-[#e4dfd7] border-y border-[#e4dfd7] dark:divide-slate-800 dark:border-slate-800">
              {savedTrips.slice(0, 3).map((trip, index) => (
                <Link
                  key={trip.itinerary_id ?? trip.id ?? `${trip.destination ?? 'trip'}-${trip.savedAt ?? index}`}
                  to={trip.itinerary_id || trip.id ? `/workspace/itinerary/${trip.itinerary_id ?? trip.id}` : '/trip-results'}
                  className="flex flex-col justify-between gap-2 py-4 text-sm transition hover:text-[#9a7650] sm:flex-row sm:items-center"
                >
                  <span>
                    <span className="block font-semibold text-slate-950 dark:text-white">
                      {trip.destination ?? 'Untitled trip'}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {trip.duration_days ?? 0} days - {trip.travelers ?? 0} travelers - {trip.planner_meta?.budget ?? 'mid'}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(trip.savedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
