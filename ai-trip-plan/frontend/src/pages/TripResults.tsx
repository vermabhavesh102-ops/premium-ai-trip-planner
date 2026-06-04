import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/apiClient'
import { createTripId, findSavedTrip, upsertSavedTrip } from '../lib/tripStorage'
import { CalendarDays, MapPin, Moon } from 'lucide-react'
import { addDaysToDateInput, formatTripDate, getInclusiveDayCount } from '../lib/tripDates'

type TripResponse = {
  id?: string
  itinerary_id?: string
  destination: string
  source: string
  duration_days: number
  travelers: number
  maps_embed_url: string
  weather?: { temperature_c?: number; summary?: string; source?: string }
  itinerary: Array<{ day: number; title: string; estimated_cost: string; tips: string[]; items: Array<{ time: string; title: string; details: string }> }>
  hotels: Array<{ name: string; area: string; price_note: string; image: string }>
  nearby_places: Array<{ name: string; category: string; rating?: number }>
  restaurants: Array<{ name: string; category: string; rating?: number; address?: string }>
  transport: Array<{ title: string; detail: string }>
  planner_meta?: { transportPref?: string; hotelPref?: string; budget?: string; interests?: string[]; startDate?: string; endDate?: string; destination?: { name?: string; region?: string; country?: string } }
  savedAt?: string
}

// Budget ranges based on preference
const budgetRanges = {
  economy: { min: 3000, max: 8000, label: 'Budget', comfort: 'Basic' },
  mid: { min: 8000, max: 18000, label: 'Mid-Range', comfort: 'Comfort' },
  luxury: { min: 18000, max: 50000, label: 'Luxury', comfort: 'Premium' },
}

// Hotel comfort levels
const comfortLevels = {
  'Boutique Hotel': { stars: 4, comfort: 'Premium Comfort', priceMultiplier: 1.2 },
  'Luxury Resort': { stars: 5, comfort: 'Ultra Luxury', priceMultiplier: 1.8 },
  'Budget Stay': { stars: 2, comfort: 'Basic Comfort', priceMultiplier: 0.6 },
  'Homestay': { stars: 3, comfort: 'Cozy Experience', priceMultiplier: 0.8 },
}

export default function TripResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tripId } = useParams()
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({ 1: true })
  const [remoteTrip, setRemoteTrip] = useState<TripResponse | null>(null)

  // Get trip from navigation state (from Workspace) or localStorage (from Planner)
  const state = location.state as { trip?: TripResponse } | null
  const trip = useMemo<TripResponse | null>(() => {
    if (remoteTrip) return remoteTrip

    const routeTrip = findSavedTrip<TripResponse>(tripId)
    if (routeTrip) return routeTrip

    // First try to get from navigation state (when coming from Workspace)
    if (state?.trip) {
      return state.trip as TripResponse
    }
    // Fallback to localStorage (when coming from Planner)
    const raw = localStorage.getItem('latest_trip')
    if (!raw) return null
    try {
      return JSON.parse(raw) as TripResponse
    } catch {
      return null
    }
  }, [remoteTrip, state, tripId])

  useEffect(() => {
    if (!tripId) return

    let cancelled = false
    apiFetch<TripResponse>(`/trips/workspace/itinerary/${tripId}`)
      .then((data) => {
        if (cancelled) return
        const normalized = { ...data, id: data.itinerary_id ?? data.id }
        setRemoteTrip(normalized)
        upsertSavedTrip(normalized)
      })
      .catch(() => {
        if (!cancelled) setRemoteTrip(null)
      })

    return () => {
      cancelled = true
    }
  }, [tripId])

  const saveTrip = () => {
    if (!trip) return
    upsertSavedTrip({ ...trip, id: trip.itinerary_id ?? trip.id ?? createTripId(), savedAt: new Date().toISOString() })
    navigate('/dashboard')
  }

  if (!trip) {
    return (
      <div className="min-h-screen premium-bg text-slate-900 dark:text-white flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-lg text-center space-y-3">
          <div className="text-2xl font-black">No itinerary generated yet</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Go back to planner to generate your AI trip.</div>
          <Link to="/planner" className="premium-button">Back to Planner</Link>
        </div>
      </div>
    )
  }

  // Calculate dynamic budget based on trip preferences (after null check)
  const budgetKey = (trip.planner_meta?.budget as keyof typeof budgetRanges) ?? 'mid'
  const budgetInfo = budgetRanges[budgetKey]
  const totalMinBudget = budgetInfo.min * trip.duration_days
  const totalMaxBudget = budgetInfo.max * trip.duration_days
  const perPersonMin = Math.round(totalMinBudget / trip.travelers)
  const perPersonMax = Math.round(totalMaxBudget / trip.travelers)

  // Get destination info
  const destinationRegion = trip.planner_meta?.destination?.region ?? trip.planner_meta?.destination?.name ?? ''
  const destinationCountry = trip.planner_meta?.destination?.country ?? 'India'
  const startDateLabel = formatTripDate(trip.planner_meta?.startDate)
  const endDateLabel = formatTripDate(trip.planner_meta?.endDate)
  const selectedDateDays = getInclusiveDayCount(trip.planner_meta?.startDate, trip.planner_meta?.endDate)
  const itineraryDays = trip.itinerary.length || trip.duration_days
  const datesMatchItinerary = selectedDateDays === itineraryDays
  const tripDays = datesMatchItinerary ? selectedDateDays : itineraryDays
  const tripNights = Math.max(0, tripDays - 1)

  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-white pb-20">
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Destination Header */}
        <section className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Destination</p>
              <h1 className="text-3xl font-black mt-1">{trip.destination}</h1>
              {destinationRegion && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {destinationRegion}{destinationCountry !== 'India' ? `, ${destinationCountry}` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full bg-[#f5eee4] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#c49a6c] dark:bg-slate-800">
                {budgetInfo.label}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {budgetInfo.comfort}
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#dfceb7] bg-gradient-to-br from-[#fffaf3] via-white to-[#f5e8d7] p-5 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#c7a575] text-white shadow-lg shadow-[#c7a575]/25">
              <CalendarDays className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a7650] dark:text-[#d5b487]">Trip Duration</p>
              <h2 className="mt-1 text-xl font-black leading-snug sm:text-2xl">
                {startDateLabel && endDateLabel && datesMatchItinerary
                  ? `Trip Duration: ${startDateLabel} - ${endDateLabel}`
                  : 'Travel dates not selected'}
              </h2>
              <div className="mt-3 flex flex-col gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 sm:flex-row sm:flex-wrap sm:gap-5">
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-[#9a7650] dark:text-[#d5b487]" aria-hidden="true" />
                  {tripNights} {tripNights === 1 ? 'Night' : 'Nights'} / {tripDays} {tripDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#9a7650] dark:text-[#d5b487]" aria-hidden="true" />
                  Destination: {trip.destination}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid md:grid-cols-4 gap-3">
          <div className="glass-panel p-4">
            <div className="text-xs text-slate-500">Trip Duration</div>
            <div className="font-black text-xl mt-1">{trip.duration_days} days</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-slate-500">Travelers</div>
            <div className="font-black text-xl mt-1">{trip.travelers}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-slate-500">Estimated Budget</div>
            <div className="font-black text-lg mt-1">₹{budgetInfo.min.toLocaleString()} - ₹{budgetInfo.max.toLocaleString()}</div>
            <div className="text-xs text-slate-500">per day</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-slate-500">Total Estimate</div>
            <div className="font-black text-lg mt-1">₹{totalMinBudget.toLocaleString()} - ₹{totalMaxBudget.toLocaleString()}</div>
            <div className="text-xs text-slate-500">₹{perPersonMin.toLocaleString()} - ₹{perPersonMax.toLocaleString()} per person</div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-black">Day-wise itinerary with timings</h2>
          {trip.itinerary.map((d) => {
            const dayDate = datesMatchItinerary && trip.planner_meta?.startDate
              ? formatTripDate(addDaysToDateInput(trip.planner_meta.startDate, d.day - 1))
              : null

            return (
            <article key={d.day} className="glass-card p-4">
              <button className="w-full text-left flex items-center justify-between gap-4" onClick={() => setOpenDays((p) => ({ ...p, [d.day]: !p[d.day] }))}>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="font-black">Day {d.day}</div>
                    {dayDate && <div className="text-xs font-bold text-[#9a7650] dark:text-[#d5b487]">{dayDate}</div>}
                  </div>
                  <div className="text-sm">{d.title}</div>
                </div>
                <div className="text-xs">{d.estimated_cost}</div>
              </button>
              {openDays[d.day] && <div className="mt-3 space-y-2">{d.items.map((it) => <div key={`${it.time}-${it.title}`} className="glass-panel p-3 text-sm"><b>{it.time}</b> • {it.title}<div className="text-slate-600 dark:text-slate-300">{it.details}</div></div>)}</div>}
            </article>
            )
          })}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <div className="font-black mb-3">Places to visit / Nearby attractions</div>
            <div className="space-y-3">
              {trip.nearby_places.map((p, idx) => {
                // Generate estimated cost based on category and budget
                const baseCost = budgetInfo.min * 0.05
                const estimatedCost = Math.round(baseCost * (idx + 1) * 2)
                return (
                  <div key={p.name} className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.category} {p.rating ? `• ${p.rating}★` : ''}</div>
                    </div>
                    <div className="text-xs font-medium text-[#c7a575] whitespace-nowrap">
                      ~₹{estimatedCost}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="font-black mb-3">Restaurants</div>
            <div className="space-y-3">
              {trip.restaurants.map((r, idx) => {
                const mealCost = Math.round(budgetInfo.min * 0.08 * (idx + 1))
                return (
                  <div key={r.name} className="pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs font-medium text-[#c7a575]">~₹{mealCost}/meal</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {r.category} {r.rating ? `• ${r.rating}★` : ''}
                    </div>
                    {r.address && <div className="text-xs text-slate-400 mt-0.5">{r.address}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-3">
          <div className="glass-card p-4"><div className="font-black mb-2">Transport plan</div>{trip.transport.map((t) => <div key={t.title} className="text-sm mb-2"><b>{t.title}</b>: {t.detail}</div>)}</div>
          <div className="glass-card p-4"><div className="font-black mb-2">Weather section</div><div className="text-sm">{trip.weather?.temperature_c ?? 24}°C • {trip.weather?.summary ?? 'Pleasant'}</div></div>
          <div className="glass-card p-4"><div className="font-black mb-2">Preferences</div><div className="text-sm">Transport: {trip.planner_meta?.transportPref ?? 'Auto'}</div><div className="text-sm">Hotel: {trip.planner_meta?.hotelPref ?? 'Auto'}</div></div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-2">Hotel recommendations</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {trip.hotels.map((h) => {
              const comfortInfo = comfortLevels[h.name as keyof typeof comfortLevels] ?? { stars: 3, comfort: 'Standard', priceMultiplier: 1.0 }
              const minPrice = Math.round(budgetInfo.min * 0.3 * comfortInfo.priceMultiplier)
              const maxPrice = Math.round(budgetInfo.max * 0.5 * comfortInfo.priceMultiplier)
              
              return (
                <article key={h.name} className="glass-card overflow-hidden">
                  <div className="h-40 relative">
                    <img src={h.image} className="cinematic-image" alt={h.name} />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {Array.from({ length: comfortInfo.stars }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-black">{h.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{h.area}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        {comfortInfo.comfort}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#c7a575]">
                      ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}/night
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{h.price_note}</div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="glass-card overflow-hidden">
          <div className="p-4 flex items-center justify-between"><div className="font-black">Maps preview</div><a className="luxury-chip" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`} target="_blank" rel="noreferrer">Open Maps</a></div>
          <iframe title="map" src={trip.maps_embed_url} className="w-full h-72" loading="lazy" />
        </section>

        <section className="flex flex-wrap gap-2">
          <button onClick={saveTrip} className="premium-button">Save Trip</button>
          <Link
            to={trip.itinerary_id || trip.id ? `/planner/${trip.itinerary_id ?? trip.id}/edit` : '/planner'}
            onClick={() => {
              if (!trip.id) localStorage.setItem('planner_edit_trip', JSON.stringify(trip))
            }}
            className="luxury-chip"
          >
            Edit Itinerary
          </Link>
          <Link to={trip.itinerary_id || trip.id ? `/workspace/itinerary/${trip.itinerary_id ?? trip.id}` : '/trip-results'} className="luxury-chip">View Itinerary</Link>
          <Link to="/workspace" className="luxury-chip">Open Dashboard</Link>
        </section>
      </main>
    </div>
  )
}
