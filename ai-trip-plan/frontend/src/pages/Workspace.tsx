import { Link } from 'react-router-dom'

type SavedTrip = {
  destination?: string
  duration_days?: number
  travelers?: number
  savedAt?: string
  planner_meta?: {
    budget?: string
    interests?: string[]
  }
}

export default function Workspace() {
  const savedTrips = (() => {
    try {
      return JSON.parse(localStorage.getItem('saved_trips') ?? '[]') as SavedTrip[]
    } catch {
      return []
    }
  })()

  return (
    <div className="min-h-[calc(100vh-92px)] bg-[#f6f1ea] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-slate-500">
              Workspace
            </p>
            <h1 className="mt-2 font-['Playfair_Display'] text-5xl font-bold leading-none tracking-normal sm:text-6xl">
              Your saved journeys
            </h1>
          </div>

          <Link
            to="/planner"
            className="inline-flex min-h-11 w-max items-center justify-center rounded-full bg-[#142018] px-6 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
          >
            + New trip
          </Link>
        </section>

        {savedTrips.length === 0 ? (
          <section className="mt-10 flex min-h-60 items-center justify-center rounded-lg border-2 border-dashed border-[#e2ddd5] px-6 py-16 text-center">
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold tracking-normal">
                No trips yet
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Plan your first itinerary to see it here.
              </p>
              <Link
                to="/planner"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d5b487] px-8 text-sm font-bold text-white transition hover:bg-[#c7a575]"
              >
                Start planning
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {savedTrips.map((trip, index) => (
              <article
                key={`${trip.destination ?? 'trip'}-${trip.savedAt ?? index}`}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#c49a6c]">
                  Saved journey
                </p>
                <h2 className="mt-4 font-['Playfair_Display'] text-3xl font-bold tracking-normal">
                  {trip.destination ?? 'Untitled trip'}
                </h2>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {trip.duration_days ?? 0} days - {trip.travelers ?? 0} travelers - {trip.planner_meta?.budget ?? 'mid'}
                </p>
                {trip.planner_meta?.interests?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trip.planner_meta.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-[#d5b487] px-3 py-1 text-xs text-slate-600 dark:text-slate-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : null}
                <Link
                  to="/trip-results"
                  className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-[#142018] px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  View itinerary
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
