import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/apiClient'

type Budget = 'economy' | 'mid' | 'luxury'
type Suggestion = {
  name: string
  region?: string
  country?: string
  hero_image: string
  overview: string
  highlights?: string[]
  rating?: number
}
type SearchResponse = { query: string; suggestions: Suggestion[] }
type TripResponse = {
  destination: string
  source: string
  duration_days: number
  travelers: number
  maps_embed_url: string
  weather?: { temperature_c?: number; summary?: string; source?: string }
  itinerary: Array<{
    day: number
    title: string
    estimated_cost: string
    tips: string[]
    items: Array<{ time: string; title: string; details: string }>
  }>
  hotels: Array<{ name: string; area: string; price_note: string; image: string }>
  nearby_places: Array<{ name: string; category: string; rating?: number }>
  restaurants: Array<{ name: string; category: string; rating?: number; address?: string }>
  transport: Array<{ title: string; detail: string }>
}

const interestsPool = ['Food', 'Culture', 'Nightlife', 'Adventure', 'Luxury', 'Family', 'Nature', 'Shopping']
const transports = ['Flight + Cab', 'Train + Local Transit', 'Road Trip', 'Metro + Walk']
const hotels = ['Boutique Hotel', 'Luxury Resort', 'Budget Stay', 'Homestay']
const fallbackImage =
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80'

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

  const destinationName = destination?.name ?? search.trim()
  const previewTitle = destinationName || 'Search your destination'
  const previewMeta = `${duration} days - ${travelers} ${travelers === 1 ? 'traveler' : 'travelers'} - ${budget}`

  useEffect(() => {
    const prefillDestination = searchParams.get('destination')?.trim()
    if (prefillDestination) {
      setSearch(prefillDestination)
    }
  }, [searchParams])

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([])
      return
    }

    const id = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await apiFetch<SearchResponse>(
          `/trips/destinations/search?q=${encodeURIComponent(search)}`,
          { method: 'GET' },
        )
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
      `${hotelPref} stay style`,
    ],
    [budget, duration, travelers, transportPref, hotelPref],
  )

  const generateItinerary = async () => {
    if (!destinationName) return

    setLoading(true)
    try {
      const res = await apiFetch<TripResponse>('/trips/generate', {
        method: 'POST',
        body: JSON.stringify({
          destination: destinationName,
          budget,
          travelers,
          duration_days: duration,
          interests,
        }),
      })
      const generatedTrip = {
        ...res,
        savedAt: new Date().toISOString(),
        planner_meta: {
          transportPref,
          hotelPref,
          destination,
          aiChips,
          interests,
          budget,
        },
      }
      localStorage.setItem('latest_trip', JSON.stringify(generatedTrip))

      const savedTrips = JSON.parse(localStorage.getItem('saved_trips') ?? '[]') as TripResponse[]
      localStorage.setItem('saved_trips', JSON.stringify([generatedTrip, ...savedTrips]))
      setTimeout(() => navigate('/trip-results'), 850)
    } finally {
      setLoading(false)
    }
  }

  const resetPlanner = () => {
    setSearch('')
    setSuggestions([])
    setDestination(null)
    setTravelers(2)
    setBudget('mid')
    setDuration(4)
    setInterests(['Food', 'Culture'])
    setTransportPref(transports[0])
    setHotelPref(hotels[0])
  }

  return (
    <div className="min-h-screen bg-[#f5eee4] pb-16 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[0.95fr_1fr]">
        <article className="self-start overflow-hidden rounded-[18px] bg-slate-950 shadow-lg shadow-slate-900/10 lg:sticky lg:top-28">
          <div className="relative min-h-[580px]">
            <img
              src={destination?.hero_image ?? fallbackImage}
              className="absolute inset-0 h-full w-full object-cover"
              alt={previewTitle}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
            <div className="absolute left-4 top-4">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-800">
                1) Destination overview
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">
                Where to next?
              </p>
              <h1 className="mt-4 font-['Playfair_Display'] text-5xl font-bold leading-none tracking-normal">
                {previewTitle}
              </h1>
              <p className="mt-4 text-sm font-bold text-white/85">{previewMeta}</p>
              {(destination?.region || destination?.country) && (
                <p className="mt-2 text-sm text-white/70">
                  {destination?.region} {destination?.country ? `- ${destination.country}` : ''}
                </p>
              )}
            </div>
          </div>
        </article>

        <article className="max-h-none overflow-y-visible pr-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-3">
          <div className="space-y-8">
            <div>
              <label className="text-sm font-bold">1) Search / select destination</label>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setDestination(null)
                }}
                placeholder="Delhi, Goa, Jaipur, Tokyo..."
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c7a575] focus:ring-4 focus:ring-[#d5b487]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {searchLoading ? (
              <div className="h-12 rounded-2xl bg-slate-100 animate-pulse dark:bg-slate-800" />
            ) : (
              <div className="max-h-44 space-y-2 overflow-auto">
                {suggestions.slice(0, 5).map((s) => (
                  <button
                    key={`${s.name}-${s.region}`}
                    type="button"
                    onClick={() => {
                      setDestination(s)
                      setSearch(s.name)
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      destination?.name === s.name
                        ? 'border-[#c7a575] bg-[#fbf6ee] dark:bg-slate-800'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {s.region} {s.country ? `- ${s.country}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className="mb-3 text-sm font-bold">2) Travelers selector: {travelers}</div>
              <input
                type="range"
                min={1}
                max={10}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full accent-[#c7a575]"
              />
            </div>

            <div>
              <div className="mb-3 text-sm font-bold">3) Budget selector</div>
              <div className="grid grid-cols-3 gap-3">
                {(['economy', 'mid', 'luxury'] as Budget[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(b)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition ${
                      budget === b
                        ? 'border-[#c7a575] bg-[#fbf6ee] dark:bg-slate-800'
                        : 'border-slate-200 bg-transparent text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-bold">4) Trip duration: {duration} days</div>
              <input
                type="range"
                min={1}
                max={12}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#c7a575]"
              />
            </div>

            <div>
              <div className="mb-3 text-sm font-bold">5) Travel interests</div>
              <div className="flex flex-wrap gap-2">
                {interestsPool.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() =>
                      setInterests((prev) =>
                        prev.includes(interest)
                          ? prev.filter((item) => item !== interest)
                          : [...prev, interest],
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      interests.includes(interest)
                        ? 'border-[#c7a575] bg-[#fbf6ee] dark:bg-slate-800'
                        : 'border-slate-200 bg-transparent text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-bold">6) Transport preference</div>
              <div className="flex flex-wrap gap-2">
                {transports.map((transport) => (
                  <button
                    key={transport}
                    type="button"
                    onClick={() => setTransportPref(transport)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      transportPref === transport
                        ? 'border-[#c7a575] bg-[#fbf6ee] dark:bg-slate-800'
                        : 'border-slate-200 bg-transparent text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    {transport}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-bold">7) Hotel preference</div>
              <div className="flex flex-wrap gap-2">
                {hotels.map((hotel) => (
                  <button
                    key={hotel}
                    type="button"
                    onClick={() => setHotelPref(hotel)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      hotelPref === hotel
                        ? 'border-[#c7a575] bg-[#fbf6ee] dark:bg-slate-800'
                        : 'border-slate-200 bg-transparent text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    {hotel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                className="min-h-12 flex-1 rounded-full bg-[#c7a575] px-6 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition hover:bg-[#b89564] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={generateItinerary}
                disabled={!destinationName || loading}
              >
                {loading ? 'Generating itinerary...' : 'Generate itinerary'}
              </button>
              <button
                type="button"
                onClick={resetPlanner}
                className="min-h-12 rounded-full border border-slate-200 px-6 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Reset
              </button>
            </div>
          </div>
        </article>
      </main>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xl font-black">Building your AI trip...</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Optimizing day-wise itinerary, hotels, restaurants, transport and maps.
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#c7a575] to-slate-900"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
