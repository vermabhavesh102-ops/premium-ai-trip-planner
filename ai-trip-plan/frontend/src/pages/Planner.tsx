import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { apiFetch } from '../lib/apiClient'

type Budget = 'economy' | 'mid' | 'luxury'
type Suggestion = { name: string; region?: string; country?: string; hero_image: string; overview: string; highlights?: string[]; rating?: number }
type SearchResponse = { query: string; suggestions: Suggestion[] }
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
}

const interestsPool = ['Food', 'Culture', 'Nightlife', 'Adventure', 'Luxury', 'Family', 'Nature', 'Shopping']
const transports = ['Flight + Cab', 'Train + Local Transit', 'Road Trip', 'Metro + Walk']
const hotels = ['Boutique Hotel', 'Luxury Resort', 'Budget Stay', 'Homestay']

export default function Planner() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [destination, setDestination] = useState<Suggestion | null>(null)

  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState<Budget>('mid')
  const [duration, setDuration] = useState(4)
  const [interests, setInterests] = useState<string[]>(['Food', 'Culture'])
  const [transportPref, setTransportPref] = useState(transports[0])
  const [hotelPref, setHotelPref] = useState(hotels[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prefillDestination = searchParams.get('destination')?.trim()
    if (prefillDestination) {
      setSearch(prefillDestination)
    }
  }, [searchParams])

  useEffect(() => {
    const id = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await apiFetch<SearchResponse>(`/trips/destinations/search?q=${encodeURIComponent(search)}`, { method: 'GET' })
        setSuggestions(res.suggestions)
      } finally {
        setSearchLoading(false)
      }
    }, 260)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    if (!destination && suggestions.length) setDestination(suggestions[0])
  }, [suggestions, destination])

  const aiChips = useMemo(
    () => [
      `${budget} budget ${duration}D route`,
      `${travelers} traveler optimized`,
      `${transportPref} transport`,
      `${hotelPref} stay style`
    ],
    [budget, duration, travelers, transportPref, hotelPref]
  )

  const generateItinerary = async () => {
    if (!destination) return
    setLoading(true)
    try {
      const res = await apiFetch<TripResponse>('/trips/generate', {
        method: 'POST',
        body: JSON.stringify({
          destination: destination.name,
          budget,
          travelers,
          duration_days: duration,
          interests
        })
      })
      localStorage.setItem(
        'latest_trip',
        JSON.stringify({
          ...res,
          planner_meta: { transportPref, hotelPref, destination }
        })
      )
      setTimeout(() => navigate('/trip-results'), 850)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-white pb-16">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/35 dark:bg-slate-950/30 border-b border-white/30 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-black">Immersive Planner Flow</div>
          <div className="flex items-center gap-2">
            <Link to="/workspace" className="luxury-chip">Workspace</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <article className="glass-card overflow-hidden">
          <div className="h-72 relative">
            <img src={destination?.hero_image ?? 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'} className="cinematic-image" alt="destination" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="luxury-chip bg-white/10 border-white/30">1) Destination overview</div>
              <div className="text-3xl font-black mt-2">{destination?.name ?? 'Search your destination'}</div>
              <div className="text-sm mt-1">{destination?.region} {destination?.country ? `• ${destination.country}` : ''}</div>
            </div>
          </div>
          <div className="p-4 text-sm">{destination?.overview ?? 'Discover destinations and build your perfect AI-generated trip.'}</div>
        </article>

        <article className="glass-card p-5 space-y-4">
          <div>
            <div className="text-sm font-bold mb-2">Search / select destination</div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Delhi, Goa, Jaipur, Tokyo..." className="w-full glass-panel px-4 py-3" />
          </div>

          {searchLoading && <div className="h-12 rounded-2xl bg-white/40 dark:bg-white/10 animate-pulse" />}
          {!searchLoading && <div className="space-y-2 max-h-44 overflow-auto">{suggestions.slice(0, 6).map((s) => <button key={`${s.name}-${s.region}`} onClick={() => setDestination(s)} className={`w-full text-left glass-panel p-3 ${destination?.name === s.name ? 'ring-2 ring-brand-400' : ''}`}><div className="font-bold">{s.name}</div><div className="text-xs text-slate-600 dark:text-slate-300">{s.region} {s.country ? `• ${s.country}` : ''}</div></button>)}</div>}

          <div className="glass-panel p-3">
            <div className="text-xs mb-2">2) Travelers selector: {travelers}</div>
            <input type="range" min={1} max={10} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} className="w-full accent-brand-500" />
          </div>

          <div>
            <div className="text-xs mb-2">3) Budget selector</div>
            <div className="grid grid-cols-3 gap-2">{(['economy', 'mid', 'luxury'] as Budget[]).map((b) => <button key={b} onClick={() => setBudget(b)} className={`luxury-chip ${budget === b ? 'ring-2 ring-brand-400' : ''}`}>{b}</button>)}</div>
          </div>

          <div className="glass-panel p-3">
            <div className="text-xs mb-2">4) Trip duration: {duration} days</div>
            <input type="range" min={1} max={12} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-brand-500" />
          </div>

          <div>
            <div className="text-xs mb-2">5) Travel interests</div>
            <div className="flex gap-2 flex-wrap">{interestsPool.map((i) => <button key={i} onClick={() => setInterests((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i])} className={`luxury-chip ${interests.includes(i) ? 'ring-2 ring-brand-400' : ''}`}>{i}</button>)}</div>
          </div>

          <div>
            <div className="text-xs mb-2">6) Transport preference</div>
            <div className="flex gap-2 flex-wrap">{transports.map((t) => <button key={t} onClick={() => setTransportPref(t)} className={`luxury-chip ${transportPref === t ? 'ring-2 ring-brand-400' : ''}`}>{t}</button>)}</div>
          </div>

          <div>
            <div className="text-xs mb-2">7) Hotel preference</div>
            <div className="flex gap-2 flex-wrap">{hotels.map((h) => <button key={h} onClick={() => setHotelPref(h)} className={`luxury-chip ${hotelPref === h ? 'ring-2 ring-brand-400' : ''}`}>{h}</button>)}</div>
          </div>

          <div>
            <div className="text-xs mb-2">8) AI suggestion chips</div>
            <div className="flex gap-2 flex-wrap">{aiChips.map((chip) => <span key={chip} className="luxury-chip">{chip}</span>)}</div>
          </div>

          <button className="premium-button w-full" onClick={generateItinerary} disabled={!destination || loading}>
            {loading ? 'Generating AI Itinerary...' : 'Generate AI Itinerary'}
          </button>
        </article>
      </main>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-8 text-center max-w-md w-full">
              <div className="text-xl font-black">Building your AI trip...</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Optimizing day-wise itinerary, hotels, restaurants, transport and maps.</div>
              <div className="mt-4 h-2 w-full rounded-full bg-white/30 overflow-hidden"><motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="h-full w-1/2 bg-gradient-to-r from-brand-500 to-sky-500" /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
