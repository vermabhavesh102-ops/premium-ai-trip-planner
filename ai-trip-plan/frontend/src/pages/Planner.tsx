import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/apiClient'
import SearchDestination from '../components/SearchDestination'
import type { Destination } from '../data/indianDestinations'
import { indianDestinations } from '../data/indianDestinations'
import { searchDestinations as searchGeoDestinations, type GeoResult } from '../lib/geoApi'

type Budget = 'economy' | 'mid' | 'luxury'
type Suggestion = Destination
type SearchResponse = { query: string; suggestions: Suggestion[] }
type TripResponse = {
  id?: string
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
  planner_meta?: {
    transportPref?: string
    hotelPref?: string
    startLocation?: string
    startDestination?: Suggestion | null
    destination?: Suggestion | null
    aiChips?: string[]
    interests?: string[]
    budget?: string
  }
}

// Use the centralized destinations data
const indianStates: Suggestion[] = indianDestinations

const interestsPool = ['Food', 'Culture', 'Nightlife', 'Adventure', 'Luxury', 'Family', 'Nature', 'Shopping']
const transports = ['Flight + Cab', 'Train + Local Transit', 'Road Trip', 'Metro + Walk']
const hotels = ['Boutique Hotel', 'Luxury Resort', 'Budget Stay', 'Homestay']
const fallbackImage =
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80'

function createLocalTrip({
  destination,
  duration,
  travelers,
  interests,
}: {
  destination: string
  duration: number
  travelers: number
  interests: string[]
}): TripResponse {
  return {
    destination,
    source: 'local-preview',
    duration_days: duration,
    travelers,
    maps_embed_url: `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`,
    weather: { temperature_c: 24, summary: 'Pleasant', source: 'preview' },
    itinerary: Array.from({ length: duration }, (_, index) => ({
      day: index + 1,
      title: `${destination} day ${index + 1}`,
      estimated_cost: 'Flexible',
      tips: ['Keep the pace relaxed and confirm timings locally.'],
      items: [
        {
          time: '09:00',
          title: 'Morning discovery',
          details: `Start with a calm introduction to ${destination}, shaped around ${interests[0] ?? 'local culture'}.`,
        },
        {
          time: '14:00',
          title: 'Local experience',
          details: `Explore a neighborhood, market, viewpoint, or museum matched to your travel style.`,
        },
        {
          time: '19:00',
          title: 'Evening plan',
          details: 'Dinner and a slower evening route with time to adjust based on energy and weather.',
        },
      ],
    })),
    hotels: [
      {
        name: `${destination} Boutique Stay`,
        area: 'Central area',
        price_note: 'Best value',
        image: fallbackImage,
      },
    ],
    nearby_places: [
      { name: `${destination} old quarter`, category: 'Culture', rating: 4.6 },
      { name: `${destination} viewpoint`, category: 'Scenic', rating: 4.5 },
    ],
    restaurants: [
      {
        name: `${destination} local table`,
        category: 'Regional',
        rating: 4.5,
        address: 'Near the central district',
      },
    ],
    transport: [
      {
        title: 'Arrival transfer',
        detail: 'Use a pre-booked cab or local transit depending on arrival time.',
      },
    ],
  }
}

export default function Planner() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [startSearch, setStartSearch] = useState('')
  const [startDestination, setStartDestination] = useState<Suggestion | null>(null)
  const [search, setSearch] = useState('')
  const [destination, setDestination] = useState<Suggestion | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState<Budget>('mid')
  const [duration, setDuration] = useState(4)
  const [interests, setInterests] = useState<string[]>(['Food', 'Culture'])
  const [transportPref, setTransportPref] = useState(transports[0])
  const [hotelPref, setHotelPref] = useState(hotels[0])
  const [loading, setLoading] = useState(false)

  const startLocationName = startDestination?.name ?? startSearch.trim()
  const destinationName = destination?.name ?? search.trim()
  const previewTitle = destinationName || 'Search your destination'
  const routePreview = startLocationName && destinationName ? `${startLocationName} → ${destinationName}` : previewTitle
  const previewMeta = `${duration} days - ${travelers} ${travelers === 1 ? 'traveler' : 'travelers'} - ${budget}`

  const [editingTripId, setEditingTripId] = useState<string | null>(null)

  useEffect(() => {
    const editDraft = localStorage.getItem('planner_edit_trip')
    if (editDraft) {
      try {
        const trip = JSON.parse(editDraft) as TripResponse
        setStartSearch(trip.planner_meta?.startLocation ?? '')
        setStartDestination(trip.planner_meta?.startDestination ?? null)
        setSearch(trip.destination ?? '')
        setDestination(null)
        setTravelers(trip.travelers ?? 2)
        setDuration(trip.duration_days ?? 4)
        setBudget(
          trip.planner_meta?.budget === 'economy' ||
            trip.planner_meta?.budget === 'mid' ||
            trip.planner_meta?.budget === 'luxury'
            ? trip.planner_meta.budget
            : 'mid',
        )
        setInterests(trip.planner_meta?.interests?.length ? trip.planner_meta.interests : ['Food', 'Culture'])
        setTransportPref(trip.planner_meta?.transportPref ?? transports[0])
        setHotelPref(trip.planner_meta?.hotelPref ?? hotels[0])
        // Store the trip ID for updating
        setEditingTripId(trip.id ?? null)
      } catch {
        localStorage.removeItem('planner_edit_trip')
      }
      localStorage.removeItem('planner_edit_trip')
      return
    }

    const prefillDestination = searchParams.get('destination')?.trim()
    if (prefillDestination) {
      setSearch(prefillDestination)
    }
  }, [searchParams])

  // API search handler for the SearchDestination component using free Geo API
  const handleApiSearch = async (query: string): Promise<Destination[]> => {
    if (!query.trim()) return [];
    
    setSearchLoading(true);
    try {
      // Use free OpenStreetMap Nominatim API for searching cities and states
      const geoResults = await searchGeoDestinations(query, 15);
      
      // Convert GeoResult to Destination format
      return geoResults.map((geo: GeoResult) => ({
        name: geo.name,
        type: geo.type === 'state' ? 'state' : 'city',
        region: geo.region,
        country: geo.country,
        parentState: geo.parentState,
        hero_image: `https://source.unsplash.com/1200x800/?${encodeURIComponent(geo.name)}`,
        overview: `${geo.name} is a ${geo.type} in ${geo.country}.`,
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setSearchLoading(false);
    }
  };


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
    if (!startLocationName || !destinationName) return

    setLoading(true)
    try {
      let res: TripResponse
      try {
        res = await apiFetch<TripResponse>('/trips/generate', {
          method: 'POST',
          body: JSON.stringify({
            destination: destinationName,
            start_location: startLocationName,
            budget,
            travelers,
            duration_days: duration,
            interests,
          }),
        })
      } catch {
        res = createLocalTrip({ destination: destinationName, duration, travelers, interests })
      }

      const generatedTrip = {
        ...res,
        id: editingTripId || crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        planner_meta: {
          transportPref,
          hotelPref,
          startLocation: startLocationName,
          startDestination,
          destination,
          aiChips,
          interests,
          budget,
        },
      }
      localStorage.setItem('latest_trip', JSON.stringify(generatedTrip))

      const savedTrips = JSON.parse(localStorage.getItem('saved_trips') ?? '[]') as TripResponse[]
      
      // Check if we're editing an existing trip
      if (editingTripId) {
        // Update the existing trip instead of creating a new one
        const updatedTrips = savedTrips.map((trip) =>
          trip.id === editingTripId ? generatedTrip : trip
        )
        localStorage.setItem('saved_trips', JSON.stringify(updatedTrips))
        setEditingTripId(null)
        
        // Navigate with edit success toast
        navigate('/workspace', {
          state: {
            workspaceToast: true,
            destination: generatedTrip.destination,
            isEdit: true,
          },
        })
      } else {
        // Create new trip
        localStorage.setItem('saved_trips', JSON.stringify([generatedTrip, ...savedTrips]))
        navigate('/workspace', {
          state: {
            workspaceToast: true,
            destination: generatedTrip.destination,
            isEdit: false,
          },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const resetPlanner = () => {
    setStartSearch('')
    setStartDestination(null)
    setSearch('')
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
                {routePreview}
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
            <div className="relative">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-sm font-bold">1) Choose your route</label>
                <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#9a7650] ring-1 ring-[#e3d4bf] dark:bg-slate-900 dark:text-[#d5b487] dark:ring-slate-700">
                  Start → End
                </span>
              </div>
              <div className="rounded-[28px] border border-[#e1d5c5] bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">●</span>
                      Start from
                    </div>
                    <SearchDestination
                      value={startSearch}
                      onChange={(value) => {
                        setStartSearch(value)
                        if (!value.trim()) setStartDestination(null)
                      }}
                      onSelect={setStartDestination}
                      selectedDestination={startDestination}
                      placeholder="Your city, airport, station..."
                      onApiSearch={handleApiSearch}
                      isLoading={searchLoading}
                      maxSuggestions={8}
                    />
                  </div>

                  <div className="flex items-center justify-center pt-1 lg:pt-9">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbc8] bg-[#fbf6ee] text-lg font-black text-[#9a7650] shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-[#d5b487] lg:h-12 lg:w-12">
                      →
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0dfc9] text-sm text-[#9a7650] dark:bg-[#d5b487]/15 dark:text-[#d5b487]">◆</span>
                      Going to
                    </div>
                    <SearchDestination
                      value={search}
                      onChange={(value) => {
                        setSearch(value)
                        if (!value.trim()) setDestination(null)
                      }}
                      onSelect={setDestination}
                      selectedDestination={destination}
                      placeholder="Delhi, Goa, Jaipur, Tokyo..."
                      onApiSearch={handleApiSearch}
                      isLoading={searchLoading}
                      maxSuggestions={8}
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#f7efe4] px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  {startLocationName || destinationName ? (
                    <span>
                      Route preview:{' '}
                      <strong className="text-slate-950 dark:text-white">{startLocationName || 'Start point'}</strong>
                      <span className="mx-2 text-[#c7a575]">→</span>
                      <strong className="text-slate-950 dark:text-white">{destinationName || 'Destination'}</strong>
                    </span>
                  ) : (
                    'Select where your trip starts and where you want to go.'
                  )}
                </div>
              </div>
            </div>

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
                disabled={!startLocationName || !destinationName || loading}
              >
                {loading ? 'Generating itinerary...' : 'Generate Trip'}
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
