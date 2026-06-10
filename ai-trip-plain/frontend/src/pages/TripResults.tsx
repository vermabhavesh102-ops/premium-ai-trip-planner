import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/apiClient'
import { createTripId, findSavedTrip, readSavedTrips, upsertSavedTrip } from '../lib/tripStorage'
import { generateTravelGuide } from '../lib/travelGuideApi'

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
  budget_recommendations?: {
    currency?: string
    budget_style?: string
    daily_range?: { min: number; max: number }
    trip_total_range?: { min: number; max: number }
    per_person_range?: { min: number; max: number }
    allocation?: Record<string, string>
  }
  travel_tips?: string[]
  planner_meta?: { transportPref?: string; hotelPref?: string; budget?: string; interests?: string[]; destination?: { name?: string; region?: string; country?: string } }
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
  const [savedTrips, setSavedTrips] = useState<TripResponse[]>(readSavedTrips)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripId ?? null)
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [guideError, setGuideError] = useState('')

  // Get trip from navigation state (from Workspace) or localStorage (from Planner)
  const state = location.state as { trip?: TripResponse } | null
  const tripKey = (savedTrip: TripResponse) => savedTrip.itinerary_id ?? savedTrip.id ?? savedTrip.destination
  const selectedSavedTrip = useMemo(
    () =>
      savedTrips.find((savedTrip) => tripKey(savedTrip) === selectedTripId) ??
      state?.trip ??
      findSavedTrip<TripResponse>(tripId),
    [savedTrips, selectedTripId, state, tripId],
  )
  const trip = useMemo<TripResponse | null>(() => {
    if (remoteTrip) return remoteTrip

    if (selectedSavedTrip) return selectedSavedTrip

    // Fallback to localStorage (when coming from Planner)
    const raw = localStorage.getItem('latest_trip')
    if (!raw) return null
    try {
      return JSON.parse(raw) as TripResponse
    } catch {
      return null
    }
  }, [remoteTrip, selectedSavedTrip])

  useEffect(() => {
    let cancelled = false

apiFetch<TripResponse[]>('/api/trips/')
      .then((trips) => {
        if (cancelled) return
        const normalized = trips.map((savedTrip) => ({
          ...savedTrip,
          id: savedTrip.itinerary_id ?? savedTrip.id,
        }))
        normalized.forEach((savedTrip) => upsertSavedTrip(savedTrip))
        setSavedTrips(normalized)
        if (!selectedTripId && normalized[0]) setSelectedTripId(tripKey(normalized[0]))
      })
 .catch((error: Error) => {
        if (!cancelled) {
          // Friendly error; do not leak raw backend details / 404 messages.
          setGuideError('Could not refresh Wish List from server. Showing locally cached trips.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTrips(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!tripId) return

    let cancelled = false
apiFetch<TripResponse>(`/api/trips/workspace/itinerary/${tripId}`)
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

  const askAi = async () => {
    if (!selectedSavedTrip) return

    setGenerating(true)
    setGuideError('')
    try {
      const generated = await generateTravelGuide<TripResponse>(selectedSavedTrip)
      setRemoteTrip(generated)
      localStorage.setItem('latest_trip', JSON.stringify(generated))
      setOpenDays({ 1: true })
    } catch (error) {
      setGuideError(error instanceof Error ? error.message : 'The AI travel guide could not be generated.')
    } finally {
      setGenerating(false)
    }
  }

  const saveTrip = () => {
    if (!trip) return
    upsertSavedTrip({ ...trip, id: trip.itinerary_id ?? trip.id ?? createTripId(), savedAt: new Date().toISOString() })
    navigate('/dashboard')
  }

  if (!trip) {
    return (
      <div className="min-h-screen premium-bg p-4 text-slate-900 dark:text-white">
        <section className="glass-card mx-auto mt-6 max-w-6xl p-6">
          <h1 className="text-3xl font-black">AI Travel Guide</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Choose a saved trip from your Wish List. The complete trip will be sent to FastAPI when you click Ask AI.
          </p>
          {loadingTrips ? (
            <p className="mt-6 text-sm font-bold text-slate-500">Loading Wish List trips...</p>
          ) : savedTrips.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {savedTrips.map((savedTrip) => {
                const key = tripKey(savedTrip)
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedTripId(key)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#c7a575] dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="text-xl font-black">{savedTrip.destination}</div>
                    <div className="mt-2 text-sm text-slate-500">{savedTrip.duration_days} days | {savedTrip.travelers} travelers</div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">Your Wish List has no saved trips yet.</p>
              <Link to="/planner" className="premium-button">Plan a trip</Link>
            </div>
          )}
          {guideError ? <p className="mt-4 text-sm text-red-600">{guideError}</p> : null}
        </section>
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

  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-white pb-20">
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <section className="glass-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9a7650]">AI Travel Guide</p>
              <h1 className="mt-2 text-3xl font-black">Choose a trip from your Wish List</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Select a saved MongoDB trip, then Ask AI. No trip details need to be entered again.
              </p>
            </div>
            <button
              type="button"
              onClick={askAi}
              disabled={!selectedSavedTrip || generating}
              className="premium-button disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? 'Building personalized guide...' : 'Ask AI'}
            </button>
          </div>

          {guideError ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {guideError}
            </p>
          ) : null}

          {loadingTrips ? (
            <p className="mt-6 text-sm font-bold text-slate-500">Loading Wish List trips...</p>
          ) : savedTrips.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {savedTrips.map((savedTrip) => {
                const key = tripKey(savedTrip)
                const selected = key === selectedTripId
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setSelectedTripId(key)
                      setRemoteTrip(null)
                      setGuideError('')
                    }}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selected
                        ? 'border-[#c7a575] bg-[#fbf6ee] ring-2 ring-[#c7a575]/20 dark:bg-slate-800'
                        : 'border-slate-200 bg-white hover:border-[#c7a575] dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-black">{savedTrip.destination}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {savedTrip.duration_days} days | {savedTrip.travelers} travelers
                        </div>
                      </div>
                      <span className="rounded-full bg-[#f5eee4] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#9a7650] dark:bg-slate-950">
                        {selected ? 'Selected' : savedTrip.planner_meta?.budget ?? 'Saved'}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span>Hotel: {savedTrip.planner_meta?.hotelPref ?? 'Flexible'}</span>
                      <span>Transport: {savedTrip.planner_meta?.transportPref ?? 'Flexible'}</span>
                      <span>{savedTrip.itinerary?.length ?? 0} itinerary days stored</span>
                      <span>{savedTrip.hotels?.length ?? 0} hotels stored</span>
                    </div>
                    {savedTrip.planner_meta?.interests?.length ? (
                      <p className="mt-3 text-xs text-slate-500">
                        Interests: {savedTrip.planner_meta.interests.join(', ')}
                      </p>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">Your Wish List has no saved trips yet.</p>
              <Link to="/planner" className="premium-button mt-4">Plan a trip</Link>
            </div>
          )}
        </section>

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
          {trip.itinerary.map((d) => (
            <article key={d.day} className="glass-card p-4">
              <button className="w-full text-left flex items-center justify-between" onClick={() => setOpenDays((p) => ({ ...p, [d.day]: !p[d.day] }))}>
                <div><div className="font-black">Day {d.day}</div><div className="text-sm">{d.title}</div></div>
                <div className="text-xs">{d.estimated_cost}</div>
              </button>
              {openDays[d.day] && <div className="mt-3 space-y-2">{d.items.map((it) => <div key={`${it.time}-${it.title}`} className="glass-panel p-3 text-sm"><b>{it.time}</b> • {it.title}<div className="text-slate-600 dark:text-slate-300">{it.details}</div></div>)}</div>}
            </article>
          ))}
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

        {trip.budget_recommendations || trip.travel_tips?.length ? (
          <section className="grid gap-4 md:grid-cols-2">
            {trip.budget_recommendations ? (
              <div className="glass-card p-4">
                <div className="font-black mb-3">AI budget recommendations</div>
                <div className="space-y-2 text-sm">
                  <p>Style: <b className="capitalize">{trip.budget_recommendations.budget_style}</b></p>
                  <p>
                    Trip total: <b>₹{trip.budget_recommendations.trip_total_range?.min.toLocaleString()} - ₹{trip.budget_recommendations.trip_total_range?.max.toLocaleString()}</b>
                  </p>
                  {Object.entries(trip.budget_recommendations.allocation ?? {}).map(([category, value]) => (
                    <p key={category} className="capitalize">{category.replaceAll('_', ' ')}: {value}</p>
                  ))}
                </div>
              </div>
            ) : null}
            {trip.travel_tips?.length ? (
              <div className="glass-card p-4">
                <div className="font-black mb-3">Personalized travel tips</div>
                <ul className="space-y-2 text-sm">
                  {trip.travel_tips.map((tip) => <li key={tip}>• {tip}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

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
          <Link to="/workspace" className="luxury-chip">Open Wish List</Link>
        </section>
      </main>
    </div>
  )
}
