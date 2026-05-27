import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ThreeBackdrop from '../components/ThreeBackdrop'
import ThemeToggle from '../components/ThemeToggle'


type Budget = 'economy' | 'mid' | 'luxury'
type TravelMode = 'flight' | 'train' | 'car'

type ItineraryDay = {
  day: number
  title: string
  bullets: string[]
}

type HotelRec = {
  name: string
  area: string
  priceNote: string
  image: string
  highlights: string[]
}

type TransportRec = {
  mode: TravelMode
  title: string
  timeNote: string
  perks: string[]
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatTravelers(n: number) {
  return n === 1 ? '1 traveler' : `${n} travelers`
}

function addDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function Home() {
  const [destination, setDestination] = useState('Paris')
  const [budget, setBudget] = useState<Budget>('mid')
  const [travelers, setTravelers] = useState(2)
  const [date, setDate] = useState<string>(addDaysISO(7))

  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'transport' | 'map'>('itinerary')

  const [focusField, setFocusField] = useState<'destination' | 'budget' | 'travelers' | 'date' | null>(null)

  const budgetLabel = useMemo(() => {
    if (budget === 'economy') return 'Economy'
    if (budget === 'luxury') return 'Luxury'
    return 'Mid-range'
  }, [budget])

  const mapsQuery = useMemo(() => {
    const encoded = encodeURIComponent(destination.trim() || 'Travel')
    return `https://www.google.com/maps?q=${encoded}&output=embed`
  }, [destination])

  const recommendations = useMemo(() => {
    const dest = destination.trim() || 'Your destination'
    const itinerarySafeDate = date || addDaysISO(7)

    const itinerary: ItineraryDay[] = [
      {
        day: 1,
        title: 'Arrival + Iconic Evening',
        bullets: [
          `Check-in and reset with a neighborhood-first plan near ${dest}.`,
          `Sunset stroll around a landmark that matches your ${budgetLabel.toLowerCase()} budget.`,
          'Dinner suggestion with quick access for a smooth first night.'
        ]
      },
      {
        day: 2,
        title: 'Local Flavor + Smart Sightseeing',
        bullets: [
          `Curated morning route through best-value spots for ${dest}.`,
          'One “high impact” attraction—optimized to reduce queues.',
          'Evening option: live shows, riverside vibes, or rooftop views.'
        ]
      },
      {
        day: 3,
        title: 'Day Trip + Hidden Gems',
        bullets: [
          'A nearby day-trip picked for minimal travel friction.',
          'Hidden gem stop chosen for photos + local character.',
          'Final-night pacing designed for energy and flexibility.'
        ]
      }
    ]

    const baseImg = (slug: string) =>
      `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=1200&q=60&sat=-10`

    const hotels: HotelRec[] = (() => {
      if (budget === 'economy') {
        return [
          {
            name: 'CityNest Stay',
            area: 'Central & Convenient',
            priceNote: 'Great value, walkable neighborhoods',
            image: baseImg('photo-1501117716987-c8e1ecb210a9'),
            highlights: ['Value-first service', 'Fast Wi‑Fi', 'Easy check-in']
          },
          {
            name: 'Budget Bloom Hotel',
            area: 'Transit-friendly',
            priceNote: 'Affordable comfort with modern rooms',
            image: baseImg('photo-1566073771259-6a8506099945'),
            highlights: ['Quiet rooms', 'Nearby cafés', 'Self check-in']
          },
          {
            name: 'CanalSide Inn',
            area: 'Scenic routes',
            priceNote: 'Best for photo spots + local food',
            image: baseImg('photo-1445019980597-93fa8acb246c'),
            highlights: ['Riverside ambiance', 'Local guides', 'Comfort bedding']
          }
        ]
      }

      if (budget === 'luxury') {
        return [
          {
            name: 'Aurora Grand Hotel',
            area: 'Signature skyline views',
            priceNote: 'Premium service + elevated amenities',
            image: baseImg('photo-1520250497591-112f2f40a3f4'),
            highlights: ['Concierge planning', 'Spa access', 'Luxury breakfast']
          },
          {
            name: 'Velvet Atelier Suites',
            area: 'Design district',
            priceNote: 'Stylish suites with top-tier comfort',
            image: baseImg('photo-1542314831-068cd1dbfeeb'),
            highlights: ['Suite upgrades', 'Premium concierge', 'Late breakfast']
          },
          {
            name: 'Skyline Crown Residence',
            area: 'Downtown prestige',
            priceNote: 'Best-in-class comfort for special trips',
            image: baseImg('photo-1560067174-8943bd5f1d2d'),
            highlights: ['Rooftop bar', 'Airport transfer', 'Tailored experiences']
          }
        ]
      }

      return [
        {
          name: 'Modern Muse Hotel',
          area: 'Walk + Metro friendly',
          priceNote: 'Balanced comfort and location',
          image: baseImg('photo-1505693416388-ac5ce068fe85'),
          highlights: ['Neighborhood vibe', 'Great reviews', 'Business-ready rooms']
        },
        {
          name: 'Boutique Atlas Stay',
          area: 'Central cultural hub',
          priceNote: 'Comfortable rooms with thoughtful details',
          image: baseImg('photo-1449831442926-4abf7e3f1a2d'),
          highlights: ['Stylish interiors', 'Helpful front desk', 'Quiet at night']
        },
        {
          name: 'Riverside Bloom Hotel',
          area: 'Scenic evening routes',
          priceNote: 'Value upgrade for memorable nights',
          image: baseImg('photo-1512917774080-9991f1c4c750'),
          highlights: ['River views', 'Local breakfast', 'Easy transit access']
        }
      ]
    })()

    const n = (dest.length + travelers + itinerarySafeDate.length) % 3
    const transportMode: TravelMode = n === 0 ? 'flight' : n === 1 ? 'train' : 'car'

    const transport: TransportRec[] = (
      [
        {
          mode: 'flight' as const,
          title: 'Fast arrival + max city time',
          timeNote: 'Optimized for early/late flexibility',
          perks: ['Best for time-saving', 'Multiple route options', 'Airport transfer tips']
        },
        {
          mode: 'train' as const,
          title: 'Scenic routes + easy connections',
          timeNote: 'Efficient transit with strong frequency',
          perks: ['Comfortable rides', 'Low friction to/from stations', 'City-center friendly']
        },
        {
          mode: 'car' as const,
          title: 'Flexible day trips + door-to-door',
          timeNote: 'Ideal for spontaneous stops',
          perks: ['Easy for groups', 'Great for day trips', 'Parking tips included']
        }
      ] satisfies TransportRec[]
    ).sort((a, b) => (a.mode === transportMode ? -1 : b.mode === transportMode ? 1 : 0))

    return { itinerary, hotels, transport }
  }, [budget, budgetLabel, date, destination, travelers])

  const onGenerate = async () => {
    setLoading(true)
    setGenerated(false)
    setActiveTab('itinerary')

    await new Promise((r) => setTimeout(r, 1050))
    await new Promise((r) => setTimeout(r, 650))

    setGenerated(true)
    setLoading(false)
  }

  const skeletonItineraryDays: ItineraryDay[] = [
    { day: 1, title: '—', bullets: [] },
    { day: 2, title: '—', bullets: [] },
    { day: 3, title: '—', bullets: [] }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <ThreeBackdrop />

      {/* Navbar */}
      <header className="sticky top-0 z-50">
        <div className="bg-white/60 dark:bg-slate-950/40 border-b border-white/50 dark:border-white/10 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500/90 to-cyan-400/70 shadow-soft flex items-center justify-center border border-white/40">
                <span className="text-lg">✦</span>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold tracking-tight text-slate-900 dark:text-white">Premium AI Trip Planner</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">Glass UI • Smart itinerary</div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <nav className="flex items-center gap-1 text-sm">
              {(
                [
                  ['itinerary', 'Itinerary'],
                  ['hotels', 'Hotels'],
                  ['transport', 'Transport'],
                  ['map', 'Maps']
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={cn(
                    'px-3 py-2 rounded-xl border transition backdrop-blur-xl',
                    activeTab === key
                      ? 'bg-white/80 dark:bg-white/10 border-white/60 dark:border-white/20 shadow-soft'
                      : 'border-transparent hover:bg-white/50 dark:hover:bg-white/5'
                  )}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
              </nav>

              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-xl border border-white/45 bg-white/40 dark:bg-white/5 text-sm font-extrabold text-slate-900 dark:text-white backdrop-blur-xl shadow-soft hover:bg-white/60 dark:hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-xl border border-brand-500/40 bg-gradient-to-r from-brand-500/20 to-sky-500/15 text-sm font-extrabold text-brand-600 dark:text-brand-300 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,143,255,0.10)] hover:brightness-110 transition"
                >
                  Signup
                </Link>

                <div className="ml-1">
                  <ThemeToggle />
                </div>
              </div>
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-2 rounded-xl border border-white/45 bg-white/40 dark:bg-white/5 text-sm font-extrabold text-slate-900 dark:text-white backdrop-blur-xl shadow-soft hover:bg-white/60 dark:hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-2 rounded-xl border border-brand-500/40 bg-gradient-to-r from-brand-500/20 to-sky-500/15 text-sm font-extrabold text-brand-600 dark:text-brand-300 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,143,255,0.10)] hover:brightness-110 transition"
              >
                Signup
              </Link>
              <ThemeToggle />
            </div>

        </div>
      </div>
      </header>

      {/* Hero + Search */}
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 relative">
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/70 via-white/40 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl shadow-soft overflow-hidden"
          >
            <div className="grid lg:grid-cols-5 gap-0">
              <div className="lg:col-span-2 p-7 sm:p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-500 text-xs font-semibold">
                  <span className="inline-block h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_0_3px_rgba(0,143,255,0.15)]" />
                  Premium AI planning, instantly
                </div>

                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
                  Plan a trip that feels
                  <span className="block bg-gradient-to-r from-brand-400 to-cyan-300 bg-clip-text text-transparent">hand-crafted</span>
                  for you.
                </h1>

                <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  Enter a destination and preferences—then get an AI-style itinerary, hotel picks, and transport recommendations.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 text-xs font-semibold">Glassmorphism UI</span>
                  <span className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 text-xs font-semibold">Responsive + animated</span>
                  <span className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 text-xs font-semibold">Dark/light mode</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 py-3">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Avg. plan time</div>
                    <div className="mt-1 text-lg font-extrabold">~2 seconds</div>
                  </div>
                  <div className="rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 py-3">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Includes</div>
                    <div className="mt-1 text-lg font-extrabold">Itinerary + Hotels + Maps</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-white/30">
                <div className="absolute inset-0 pointer-events-none opacity-70">
                  <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand-500/25 blur-2xl" />
                  <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-2xl" />
                </div>

                <div className="relative">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Destination</label>

                      <motion.div
                        onFocus={() => setFocusField('destination')}
                        onBlur={() => setFocusField(null)}
                        className={cn(
                          'relative rounded-2xl border backdrop-blur-xl bg-white/50 dark:bg-white/5 transition',
                          focusField === 'destination' ? 'border-brand-400/60 shadow-soft' : 'border-white/40 dark:border-white/10'
                        )}
                      >
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300">🗺️</div>
                        <input
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Where to next?"
                          className="w-full bg-transparent pl-10 pr-3 py-3 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400"
                        />
                      </motion.div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Paris', 'Bali', 'Tokyo', 'Rome', 'New York'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setDestination(s)}
                            className="text-xs px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/55 dark:hover:bg-white/10 transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full sm:w-56">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Budget</label>

                      <motion.div
                        onFocus={() => setFocusField('budget')}
                        onBlur={() => setFocusField(null)}
                        className={cn(
                          'rounded-2xl border backdrop-blur-xl bg-white/50 dark:bg-white/5 transition',
                          focusField === 'budget' ? 'border-brand-400/60 shadow-soft' : 'border-white/40 dark:border-white/10'
                        )}
                      >
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value as Budget)}
                          className="w-full bg-transparent py-3 px-3 pr-8 outline-none text-slate-900 dark:text-slate-100"
                        >
                          <option value="economy">Economy</option>
                          <option value="mid">Mid-range</option>
                          <option value="luxury">Luxury</option>
                        </select>
                      </motion.div>

                      <div className="mt-3 rounded-2xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl px-3 py-2">
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">AI Budget</div>
                        <div className="mt-1 text-sm font-extrabold">{budgetLabel}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Travelers</label>

                      <motion.div
                        onFocus={() => setFocusField('travelers')}
                        onBlur={() => setFocusField(null)}
                        className={cn(
                          'rounded-2xl border backdrop-blur-xl bg-white/50 dark:bg-white/5 transition p-3',
                          focusField === 'travelers' ? 'border-brand-400/60 shadow-soft' : 'border-white/40 dark:border-white/10'
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                            className="h-9 w-9 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition"
                            aria-label="Decrease travelers"
                          >
                            −
                          </button>

                          <div className="text-center">
                            <div className="text-sm font-extrabold">{formatTravelers(travelers)}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-300">Adjust group size</div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setTravelers((n) => Math.min(8, n + 1))}
                            className="h-9 w-9 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition"
                            aria-label="Increase travelers"
                          >
                            +
                          </button>
                        </div>

                        <input
                          type="range"
                          min={1}
                          max={8}
                          value={travelers}
                          onChange={(e) => setTravelers(parseInt(e.target.value, 10))}
                          className="mt-3 w-full accent-brand-400"
                          aria-label="Travelers slider"
                        />
                      </motion.div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Date</label>

                      <motion.div
                        onFocus={() => setFocusField('date')}
                        onBlur={() => setFocusField(null)}
                        className={cn(
                          'rounded-2xl border backdrop-blur-xl bg-white/50 dark:bg-white/5 transition px-3 py-3',
                          focusField === 'date' ? 'border-brand-400/60 shadow-soft' : 'border-white/40 dark:border-white/10'
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-slate-500 dark:text-slate-300">📅</div>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={onGenerate}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className={cn(
                        'flex-1 inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold px-4 py-3 border transition',
                        'bg-brand-500 text-white border-brand-500/40 shadow-[0_18px_60px_rgba(0,143,255,0.25)]',
                        'hover:bg-brand-600 focus:outline-none',
                        loading ? 'opacity-80 cursor-not-allowed' : ''
                      )}
                    >
                      {loading ? (
                        <>
                          <span className="inline-block h-5 w-5 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                          Generating Trip…
                        </>
                      ) : (
                        <>
                          <span>✨</span> Generate Trip
                        </>
                      )}
                    </motion.button>

                    <div className="sm:w-56 flex items-center justify-between gap-3 rounded-2xl border border-white/35 dark:border-white/10 bg-white/30 dark:bg-white/5 px-4 py-3 backdrop-blur-xl">
                      <div className="text-xs">
                        <div className="font-extrabold">AI Mode</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">{budgetLabel} • {travelers} group</div>
                      </div>
                      <div className="text-lg">🧠</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                    Tip: This UI uses mocked AI results (no backend call yet) but is structured for real data.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Results */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {generated ? `Your ${destination.trim() || 'Trip'} Blueprint` : 'Your AI Trip Blueprint'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {generated
                  ? 'Curated for your preferences—glass cards, premium details.'
                  : 'Generate to see itinerary, hotel suggestions, transport recommendations, and maps.'}
              </p>
            </div>

            <div className="hidden md:flex gap-2">
              {(
                [
                  ['itinerary', 'Itinerary'],
                  ['hotels', 'Hotels'],
                  ['transport', 'Transport'],
                  ['map', 'Maps']
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'px-3 py-2 rounded-xl border text-sm transition backdrop-blur-xl',
                    activeTab === key
                      ? 'bg-white/80 dark:bg-white/10 border-white/60 dark:border-white/20 shadow-soft'
                      : 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/55 dark:hover:bg-white/10'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid lg:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              {activeTab === 'itinerary' && (
                <motion.div
                  key="itinerary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="lg:col-span-2"
                >
                  <div className="rounded-3xl border border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-soft">
                    <div className="p-6 border-b border-white/35 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-brand-500 font-extrabold">AI Itinerary</div>
                        <div className="text-2xl font-extrabold">Day-by-day plan</div>
                      </div>
                      <div className="text-3xl">🗓️</div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-3">
                        {(generated ? recommendations.itinerary : skeletonItineraryDays).map((d, idx) => (
                          <motion.div
                            key={d.day}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.05 }}
                            className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Day {d.day}</div>
                              <div className="text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/25 font-semibold">
                                {generated ? 'Curated' : 'Ready'}
                              </div>
                            </div>

                            <div className="mt-2 font-extrabold text-lg">{d.title}</div>

                            <ul className="mt-3 space-y-2">
                              {generated
                                ? d.bullets.map((b, i) => (
                                    <li key={i} className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed flex gap-2">
                                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-400" />
                                      {b}
                                    </li>
                                  ))
                                : [0].map((_, i) => (
                                    <li key={i} className="text-sm text-slate-700 dark:text-slate-200 flex gap-2">
                                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                                      Generate Trip to unlock AI suggestions.
                                    </li>
                                  ))}
                            </ul>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'hotels' && (
                <motion.div
                  key="hotels"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="lg:col-span-2"
                >
                  <div className="rounded-3xl border border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-soft">
                    <div className="p-6 border-b border-white/35 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-brand-500 font-extrabold">Hotel Picks</div>
                        <div className="text-2xl font-extrabold">Best match for {budgetLabel}</div>
                      </div>
                      <div className="text-3xl">🏨</div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-3">
                        {(generated
                          ? recommendations.hotels
                          : [0, 1, 2].map((i) => ({
                              name: `Loading ${i}`,
                              area: '',
                              priceNote: '',
                              image: '',
                              highlights: []
                            }))
                        ).map((h: HotelRec | { name: string; area: string; priceNote: string; image: string; highlights: string[] }, idx: number) => {
                          if (!generated) {
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.05 }}
                                className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 overflow-hidden"
                              >
                                <div className="h-28 bg-gradient-to-r from-brand-500/20 to-cyan-400/10 animate-pulse" />
                                <div className="p-4">
                                  <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
                                  <div className="mt-3 h-3 bg-slate-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />
                                  <div className="mt-2 h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2 animate-pulse" />
                                </div>
                              </motion.div>
                            )
                          }

                          const hh = h as HotelRec
                          return (
                            <motion.div
                              key={hh.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: idx * 0.06 }}
                              className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 overflow-hidden"
                            >
                              <div className="h-28 sm:h-32 relative">
                                <img src={hh.image} alt={hh.name} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3">
                                  <div className="text-xs px-2 py-1 rounded-full bg-white/15 border border-white/25 text-white font-semibold backdrop-blur">
                                    {hh.area}
                                  </div>
                                </div>
                              </div>

                              <div className="p-4">
                                <div className="font-extrabold text-base">{hh.name}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{hh.priceNote}</div>
                                <div className="mt-3 space-y-1">
                                  {hh.highlights.slice(0, 3).map((x, i) => (
                                    <div key={i} className="text-sm text-slate-700 dark:text-slate-200 flex gap-2">
                                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-400" />
                                      {x}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'transport' && (
                <motion.div
                  key="transport"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="lg:col-span-2"
                >
                  <div className="rounded-3xl border border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-soft">
                    <div className="p-6 border-b border-white/35 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-brand-500 font-extrabold">Transport</div>
                        <div className="text-2xl font-extrabold">Smart route strategy</div>
                      </div>
                      <div className="text-3xl">🚆</div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-3">
                        {(generated ? recommendations.transport : ([0, 1, 2] as const))
                          .map((t: any, idx: number) => {
                            if (!generated) {
                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                                  className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4"
                                >
                                  <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />
                                  <div className="mt-3 h-3 bg-slate-200 dark:bg-white/10 rounded w-full animate-pulse" />
                                  <div className="mt-2 h-3 bg-slate-200 dark:bg-white/10 rounded w-4/5 animate-pulse" />
                                </motion.div>
                              )
                            }

                            const tt = t as TransportRec
                            const icon = tt.mode === 'flight' ? '✈️' : tt.mode === 'train' ? '🚆' : '🚗'

                            return (
                              <motion.div
                                key={tt.mode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.06 }}
                                className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-2xl">{icon}</div>
                                  <div className="text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/25 font-semibold">
                                    {tt.mode.toUpperCase()}
                                  </div>
                                </div>
                                <div className="mt-2 font-extrabold text-lg">{tt.title}</div>
                                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tt.timeNote}</div>
                                <div className="mt-3 space-y-2">
                                  {tt.perks.map((p, i) => (
                                    <div key={i} className="text-sm text-slate-700 dark:text-slate-200 flex gap-2">
                                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-400" />
                                      {p}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'map' && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="lg:col-span-2"
                >
                  <div className="rounded-3xl border border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-soft">
                    <div className="p-6 border-b border-white/35 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-brand-500 font-extrabold">Google Maps</div>
                        <div className="text-2xl font-extrabold">Your destination view</div>
                      </div>
                      <div className="text-3xl">📍</div>
                    </div>

                    <div className="p-6">
                      <div className="rounded-2xl overflow-hidden border border-white/35 dark:border-white/10 bg-white/40 dark:bg-white/5">
                        <div className="px-4 py-3 border-b border-white/25 dark:border-white/10 flex items-center justify-between">
                          <div className="text-sm font-extrabold">Focus: {destination.trim() || 'Travel'}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-300">Embed via query</div>
                        </div>
                        <div className="h-[320px] sm:h-[420px]">
                          <iframe
                            title="Google Maps"
                            className="w-full h-full"
                            src={mapsQuery}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4">
                          <div className="text-sm font-extrabold">Pro tip</div>
                          <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            Pick a hotel area first—then the itinerary becomes effortless.
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4">
                          <div className="text-sm font-extrabold">Smart routing</div>
                          <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            Transport recommendations aim to reduce backtracking and maximize city time.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Side summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="rounded-3xl border border-white/40 bg-white/35 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-soft"
              >
                <div className="p-6 border-b border-white/35 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-brand-500 font-extrabold">Trip Summary</div>
                      <div className="text-xl font-extrabold mt-1">{destination.trim() || 'Your trip'}</div>
                    </div>
                    <div className="text-3xl">💎</div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/45 dark:bg-white/5 p-4">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">When</div>
                      <div className="mt-1 text-base font-extrabold">{date}</div>
                    </div>
                    <div className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/45 dark:bg-white/5 p-4">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Budget</div>
                      <div className="mt-1 text-base font-extrabold">{budgetLabel}</div>
                    </div>
                    <div className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/45 dark:bg-white/5 p-4">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Travelers</div>
                      <div className="mt-1 text-base font-extrabold">{travelers}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-sm font-extrabold">What you’ll get</div>
                  <div className="mt-3 space-y-3">
                    {[
                      { icon: '🗓️', title: 'AI itinerary', desc: 'Day-by-day suggestions with smart pacing.' },
                      { icon: '🏨', title: 'Hotel recommendations', desc: 'Premium picks matching your budget + area feel.' },
                      { icon: '🚆', title: 'Transport ideas', desc: 'Routes selected to reduce backtracking.' },
                      { icon: '🗺️', title: 'Google Maps view', desc: 'A destination frame to plan around.' }
                    ].map((x) => (
                      <div key={x.title} className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/45 dark:bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{x.icon}</div>
                          <div>
                            <div className="font-extrabold">{x.title}</div>
                            <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">{x.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 pb-10">
          <div className="mx-auto max-w-6xl px-0">
            <div className="rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft px-6 py-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="font-extrabold tracking-tight">Premium AI Trip Planner</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Built with glassmorphism UI, animations, and a responsive layout.
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {['Privacy', 'Terms', 'Support'].map((l) => (
                    <button
                      key={l}
                      className="text-xs px-3 py-2 rounded-full border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/55 dark:hover:bg-white/10 transition"
                      type="button"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
                © {new Date().getFullYear()} AI Trip Planner. Mocked recommendations for UI demo.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

