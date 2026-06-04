import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { readSavedTrips } from '../lib/tripStorage'

type SavedTrip = {
  id?: string
  itinerary_id?: string
  destination?: string
  duration_days?: number
  travelers?: number
  savedAt?: string
  planner_meta?: {
    budget?: string
    interests?: string[]
    transportPref?: string
    hotelPref?: string
  }
}

type ToastState = {
  type: 'add' | 'edit' | 'delete'
  title: string
  detail?: string
}

const formatDate = (value?: string) => {
  if (!value) return 'Recently'

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default function Workspace() {
  const location = useLocation()
  const navigate = useNavigate()
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(readSavedTrips)
  const state = location.state as { workspaceToast?: boolean; destination?: string; isEdit?: boolean } | null
  const [toast, setToast] = useState<ToastState | null>(
    state?.workspaceToast
      ? state.isEdit
        ? {
            type: 'edit',
            title: 'Edit Successful',
            detail: state.destination ? `${state.destination} was updated successfully.` : undefined,
          }
        : {
            type: 'add',
            title: 'Added to workspace!',
            detail: state.destination ? `${state.destination} was saved successfully.` : undefined,
          }
      : null,
  )

  const deleteTrip = (tripToDelete: SavedTrip) => {
    const nextTrips = savedTrips.filter((trip) => trip.id !== tripToDelete.id)
    setSavedTrips(nextTrips)
    localStorage.setItem('saved_trips', JSON.stringify(nextTrips))
    setToast({
      type: 'delete',
      title: 'Deleted from workspace!',
      detail: tripToDelete.destination ? `${tripToDelete.destination} was removed.` : undefined,
    })
  }

  const closeToast = () => {
    setToast(null)
    navigate(location.pathname, { replace: true })
  }

  useEffect(() => {
    if (!toast) return

    const id = window.setTimeout(() => {
      setToast(null)
      navigate(location.pathname, { replace: true })
    }, 3500)

    return () => window.clearTimeout(id)
  }, [location.pathname, navigate, toast])

  const toastTone = toast?.type === 'delete' ? 'bg-red-600' : 'bg-green-600'

  return (
    <div className="min-h-[calc(100vh-92px)] bg-[#f6f1ea] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      {toast ? (
        <div className="fixed right-4 top-4 z-[70] w-[calc(100%-2rem)] max-w-xs overflow-hidden rounded bg-white shadow-xl shadow-slate-900/15 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:right-6 sm:top-6">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white ${toastTone}`}>
              {toast.type === 'delete' ? 'x' : toast.type === 'edit' ? '✓' : '✓'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                {toast.title}
              </p>
              {toast.detail ? (
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {toast.detail}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={closeToast}
              className="text-lg leading-none text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
          <motion.div
            className={`h-1.5 ${toastTone}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3.5, ease: 'linear' }}
          />
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-slate-500">
              Workspace
            </p>
            <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-bold leading-none tracking-normal sm:text-5xl">
              Your saved journeys
            </h1>
          </div>

          <Link
            to="/planner"
            className="inline-flex min-h-11 w-max items-center justify-center rounded-full bg-[#142018] px-6 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 dark:bg-[#d5b487] dark:text-slate-950"
          >
            + New trip
          </Link>
          
        </section>

        {savedTrips.length === 0 ? (
          <section className="mt-10 flex min-h-60 items-center justify-center rounded-lg border-2 border-dashed border-[#e2ddd5] px-6 py-16 text-center dark:border-slate-800">
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
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            {savedTrips.map((trip, index) => (
              <article
                key={trip.itinerary_id ?? trip.id ?? `${trip.destination ?? 'trip'}-${trip.savedAt ?? index}`}
                className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-['Playfair_Display'] text-3xl font-bold leading-none tracking-normal">
                      {trip.destination ?? 'Untitled trip'}
                    </h2>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(trip.savedAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f5eee4] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#c49a6c] dark:bg-slate-800">
                    {trip.planner_meta?.budget ?? 'mid'}
                  </span>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500">
                      Duration
                    </p>
                    <p className="mt-2 text-lg">{trip.duration_days ?? 0} days</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500">
                      Travelers
                    </p>
                    <p className="mt-2 text-lg">{trip.travelers ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500">
                      Transport
                    </p>
                    <p className="mt-2 text-lg">{trip.planner_meta?.transportPref ?? 'Auto'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500">
                      Hotel
                    </p>
                    <p className="mt-2 text-lg">{trip.planner_meta?.hotelPref ?? 'Auto'}</p>
                  </div>
                </div>

                {trip.planner_meta?.interests?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {trip.planner_meta.interests.slice(0, 4).map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => deleteTrip(trip)}
                    className="text-sm font-medium text-slate-600 transition hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/planner/${trip.itinerary_id ?? trip.id}/edit`}
                    className="text-sm font-medium text-slate-600 transition hover:text-[#9a7650] dark:text-slate-300"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/workspace/itinerary/${trip.itinerary_id ?? trip.id}`}
                    state={{ trip }}
                    className="text-sm font-medium text-slate-600 transition hover:text-[#9a7650] dark:text-slate-300"
                  >
                    AI Travel Guide
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
