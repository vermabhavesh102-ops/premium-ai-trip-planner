import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

type TripResponse = {
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
  planner_meta?: { transportPref?: string; hotelPref?: string }
}

export default function TripResults() {
  const navigate = useNavigate()
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({ 1: true })

  const trip = useMemo<TripResponse | null>(() => {
    const raw = localStorage.getItem('latest_trip')
    if (!raw) return null
    try {
      return JSON.parse(raw) as TripResponse
    } catch {
      return null
    }
  }, [])

  const saveTrip = () => {
    if (!trip) return
    const raw = localStorage.getItem('saved_trips')
    const existing = raw ? (JSON.parse(raw) as TripResponse[]) : []
    localStorage.setItem('saved_trips', JSON.stringify([{ ...trip, savedAt: new Date().toISOString() }, ...existing]))
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

  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-white pb-20">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/35 dark:bg-slate-950/30 border-b border-white/30 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-black">Trip Results • {trip.destination}</div>
          <div className="flex items-center gap-2">
            <Link to="/planner" className="luxury-chip">Back to Planner</Link>
            <Link to="/workspace" className="luxury-chip">Open Dashboard</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        <section className="grid md:grid-cols-3 gap-3">
          <div className="glass-panel p-4"><div className="text-xs text-slate-500">Trip duration</div><div className="font-black">{trip.duration_days} days</div></div>
          <div className="glass-panel p-4"><div className="text-xs text-slate-500">Travelers</div><div className="font-black">{trip.travelers}</div></div>
          <div className="glass-panel p-4"><div className="text-xs text-slate-500">Estimated budget</div><div className="font-black">₹8,000 - ₹18,000/day</div></div>
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

        <section className="grid md:grid-cols-2 gap-3">
          <div className="glass-card p-4"><div className="font-black mb-2">Places to visit / Nearby attractions</div>{trip.nearby_places.map((p) => <div key={p.name} className="text-sm mb-2"><b>{p.name}</b> ({p.category}) {p.rating ? `• ${p.rating}★` : ''}</div>)}</div>
          <div className="glass-card p-4"><div className="font-black mb-2">Restaurants</div>{trip.restaurants.map((r) => <div key={r.name} className="text-sm mb-2"><b>{r.name}</b> {r.rating ? `• ${r.rating}★` : ''}<div className="text-slate-600 dark:text-slate-300">{r.address}</div></div>)}</div>
        </section>

        <section className="grid md:grid-cols-3 gap-3">
          <div className="glass-card p-4"><div className="font-black mb-2">Transport plan</div>{trip.transport.map((t) => <div key={t.title} className="text-sm mb-2"><b>{t.title}</b>: {t.detail}</div>)}</div>
          <div className="glass-card p-4"><div className="font-black mb-2">Weather section</div><div className="text-sm">{trip.weather?.temperature_c ?? 24}°C • {trip.weather?.summary ?? 'Pleasant'}</div></div>
          <div className="glass-card p-4"><div className="font-black mb-2">Preferences</div><div className="text-sm">Transport: {trip.planner_meta?.transportPref ?? 'Auto'}</div><div className="text-sm">Hotel: {trip.planner_meta?.hotelPref ?? 'Auto'}</div></div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-2">Hotel recommendations</h2>
          <div className="grid md:grid-cols-3 gap-3">{trip.hotels.map((h) => <article key={h.name} className="glass-card overflow-hidden"><div className="h-36"><img src={h.image} className="cinematic-image" alt={h.name} /></div><div className="p-4"><div className="font-black">{h.name}</div><div className="text-sm text-slate-600 dark:text-slate-300">{h.area} • {h.price_note}</div></div></article>)}</div>
        </section>

        <section className="glass-card overflow-hidden">
          <div className="p-4 flex items-center justify-between"><div className="font-black">Maps preview</div><a className="luxury-chip" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`} target="_blank" rel="noreferrer">Open Maps</a></div>
          <iframe title="map" src={trip.maps_embed_url} className="w-full h-72" loading="lazy" />
        </section>

        <section className="flex flex-wrap gap-2">
          <button onClick={saveTrip} className="premium-button">Save Trip</button>
          <Link to="/planner" className="luxury-chip">Edit Itinerary</Link>
          <Link to="/trip-results" className="luxury-chip">View Itinerary</Link>
          <Link to="/workspace" className="luxury-chip">Open Dashboard</Link>
        </section>
      </main>
    </div>
  )
}
