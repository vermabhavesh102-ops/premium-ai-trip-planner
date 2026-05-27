import { useMemo, useState } from 'react'
import { Bell, Search, Sparkles, TrendingUp } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

type NavKey = 'overview' | 'saved' | 'analystics' | 'trips'

type SavedTrip = {
  id: string
  title: string
  location: string
  date: string
  budget: string
  status: 'Saved' | 'Draft' | 'Planned'
}

type Trip = {
  id: string
  title: string
  location: string
  date: string
  tag: string
  progress: number
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatPercent(n: number) {
  return `${Math.round(n)}%`
}

export default function Dashboard() {
  const [active, setActive] = useState<NavKey>('overview')
  const [query, setQuery] = useState('')

  const savedTrips: SavedTrip[] = useMemo(
    () => [
      {
        id: 't1',
        title: 'Rome Escape',
        location: 'Rome, Italy',
        date: '2026-08-14',
        budget: 'Mid-range',
        status: 'Saved'
      },
      {
        id: 't2',
        title: 'Tokyo Neon Week',
        location: 'Tokyo, Japan',
        date: '2026-10-03',
        budget: 'Luxury',
        status: 'Planned'
      },
      {
        id: 't3',
        title: 'Paris Weekend',
        location: 'Paris, France',
        date: '2026-09-05',
        budget: 'Economy',
        status: 'Draft'
      }
    ],
    []
  )

  const analystics = useMemo(
    () => [
      {
        label: 'Trips this month',
        value: '12',
        sub: '+2 vs last month',
        accent: 'from-brand-500/20 to-sky-500/10'
      },
      {
        label: 'Most planned destination',
        value: 'Rome',
        sub: 'Trending',
        accent: 'from-cyan-400/20 to-brand-500/10'
      },
      {
        label: 'Avg. plan time',
        value: '2.1s',
        sub: 'Faster suggestions',
        accent: 'from-sky-500/20 to-brand-500/10'
      }
    ],
    []
  )

  const trips: Trip[] = useMemo(
    () => [
      { id: 'd1', title: 'Premium itinerary draft', location: 'Lisbon, PT', date: '2026-07-21', tag: 'AI Generated', progress: 78 },
      { id: 'd2', title: 'Hotel shortlist', location: 'Barcelona, ES', date: '2026-07-30', tag: 'Curated', progress: 52 },
      { id: 'd3', title: 'Transport optimization', location: 'Prague, CZ', date: '2026-08-09', tag: 'Smart route', progress: 91 }
    ],
    []
  )

  const filteredSavedTrips = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return savedTrips
    return savedTrips.filter((t) => `${t.title} ${t.location} ${t.budget}`.toLowerCase().includes(q))
  }, [query, savedTrips])

  const pageTitle = useMemo(() => {
    switch (active) {
      case 'overview':
        return 'Dashboard Overview'
      case 'saved':
        return 'Saved Trips'
      case 'analystics':
        return 'Analystics'
      case 'trips':
        return 'Your Trips'
      default:
        return 'Dashboard'
    }
  }, [active])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Decorative overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand-500/25 blur-2xl" />
        <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-2xl" />
      </div>

      <div className="relative">
        {/* Top bar */}
        <header className="sticky top-0 z-40">
          <div className="bg-white/60 dark:bg-slate-950/40 border-b border-white/50 dark:border-white/10 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500/90 to-cyan-400/70 shadow-soft flex items-center justify-center border border-white/40">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="leading-tight">
                  <div className="font-extrabold tracking-tight text-slate-900 dark:text-white">Premium Dashboard</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">Saved trips • Analystics • Insights</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/35 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-3 py-2">
                  <Search className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search trips..."
                    className="bg-transparent outline-none text-sm w-56 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <button
                  type="button"
                  className="h-10 w-10 rounded-2xl border border-white/35 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-soft flex items-center justify-center hover:bg-white/55 dark:hover:bg-white/10 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>

                <div className="ml-1">
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Mobile search */}
            <div className="md:hidden px-4 pb-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/35 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-3 py-2">
                <Search className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search trips..."
                  className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid lg:grid-cols-[260px_1fr] gap-4">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft p-3">
                <div className="px-2 py-2">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Navigation</div>
                </div>

                <div className="space-y-2">
                  {(
                    [
                      ['overview', 'Overview', '✨'],
                      ['saved', 'Saved Trips', '💎'],
                      ['analystics', 'Analystics', '📈'],
                      ['trips', 'Trips', '🧳']
                    ] as const
                  ).map(([key, label, icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActive(key)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-2xl border transition flex items-center justify-between',
                        active === key
                          ? 'bg-white/80 dark:bg-white/10 border-white/60 dark:border-white/20 shadow-soft'
                          : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5'
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <span className="text-sm font-extrabold">{label}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 px-2">
                  <div className="rounded-2xl border border-white/35 bg-white/45 dark:bg-white/5 px-4 py-3">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Status</div>
                    <div className="mt-1 text-sm font-extrabold">Welcome</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Your trips are ready.</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="space-y-4">
              {/* Page header */}
              <div className="rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-brand-500">{active.toUpperCase()}</div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">{pageTitle}</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Premium cards with a responsive, modern layout.
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <div className="rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 py-3">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Trend</div>
                      <div className="mt-1 inline-flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-brand-500" />
                        <div className="text-lg font-extrabold">+18%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content blocks */}
              {active === 'overview' && (
                <section className="grid xl:grid-cols-3 gap-4">
                  {analystics.map((c) => (
                    <div
                      key={c.label}
                      className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-soft overflow-hidden"
                    >
                      <div className={cn('h-2 bg-gradient-to-r', c.accent)} />
                      <div className="p-5">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{c.label}</div>
                        <div className="mt-2 text-3xl font-extrabold">{c.value}</div>
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.sub}</div>
                      </div>
                    </div>
                  ))}

                  <div className="xl:col-span-3 rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold">Upcoming progress</div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">AI planning and curation status.</div>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-2xl border border-brand-500/40 bg-gradient-to-r from-brand-500/20 to-sky-500/15 text-sm font-extrabold text-brand-600 dark:text-brand-300 backdrop-blur-xl hover:brightness-110 transition"
                        onClick={() => setActive('trips')}
                      >
                        View trips
                      </button>
                    </div>

                    <div className="mt-4 grid md:grid-cols-3 gap-3">
                      {trips.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-extrabold">{t.title}</div>
                              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t.location}</div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-500 font-semibold">
                              {t.tag}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Progress</div>
                              <div className="text-xs font-extrabold">{formatPercent(t.progress)}</div>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/20 dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-sky-500"
                                style={{ width: `${t.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">ETA: {t.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {active === 'saved' && (
                <section className="rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft p-5">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-extrabold">Saved trip cards</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        Filtered by your search query.
                      </div>
                    </div>
                    <div className="text-xs px-3 py-2 rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5">
                      {filteredSavedTrips.length} results
                    </div>
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSavedTrips.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-soft overflow-hidden"
                      >
                        <div className="h-2 bg-gradient-to-r from-brand-500/60 to-cyan-400/40" />
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-extrabold">{t.title}</div>
                              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.location}</div>
                            </div>
                            <span
                              className={cn(
                                'text-xs px-2 py-1 rounded-full border font-semibold',
                                t.status === 'Saved'
                                  ? 'bg-brand-500/10 border-brand-500/25 text-brand-500'
                                  : t.status === 'Planned'
                                    ? 'bg-cyan-400/10 border-cyan-400/25 text-cyan-300'
                                    : 'bg-slate-200/20 border-slate-200/30 text-slate-200'
                              )}
                            >
                              {t.status}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/35 bg-white/35 dark:bg-white/5 px-3 py-2">
                              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">DATE</div>
                              <div className="mt-1 text-xs font-extrabold">{t.date}</div>
                            </div>
                            <div className="rounded-2xl border border-white/35 bg-white/35 dark:bg-white/5 px-3 py-2">
                              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">BUDGET</div>
                              <div className="mt-1 text-xs font-extrabold">{t.budget}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              className="flex-1 px-4 py-2 rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 text-sm font-extrabold hover:bg-white/55 dark:hover:bg-white/10 transition"
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 rounded-2xl border border-brand-500/40 bg-gradient-to-r from-brand-500/20 to-sky-500/15 text-sm font-extrabold text-brand-600 dark:text-brand-300 backdrop-blur-xl hover:brightness-110 transition"
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {active === 'analystics' && (
                <section className="rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft p-5">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-extrabold">Analystics cards</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Premium insights (mocked).</div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 text-sm font-extrabold hover:bg-white/55 dark:hover:bg-white/10 transition"
                      onClick={() => setActive('overview')}
                    >
                      Back to overview
                    </button>
                  </div>

                  <div className="mt-4 grid lg:grid-cols-2 gap-4">
                    <div className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-extrabold">Saved trip velocity</div>
                          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Last 7 days</div>
                        </div>
                        <div className="text-xs px-3 py-2 rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-500 font-semibold">
                          +24%
                        </div>
                      </div>

                      <div className="mt-5 h-48 rounded-3xl bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 p-3 flex items-end gap-2">
                        {[
                          18, 35, 22, 52, 41, 63, 58
                        ].map((v, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full rounded-2xl bg-gradient-to-t from-brand-500/70 to-sky-500/70"
                              style={{ height: `${v}%` }}
                            />
                            <div className="text-[10px] text-slate-600 dark:text-slate-300">D{i + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-5">
                      <div className="text-sm font-extrabold">AI insight breakdown</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Where users spend planning time.</div>

                      <div className="mt-5 space-y-3">
                        {[
                          { k: 'Itinerary', v: 46, color: 'from-brand-500 to-sky-500' },
                          { k: 'Hotels', v: 28, color: 'from-cyan-400 to-brand-500' },
                          { k: 'Transport', v: 26, color: 'from-sky-500 to-cyan-400' }
                        ].map((r) => (
                          <div key={r.k}>
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{r.k}</div>
                              <div className="text-xs font-extrabold">{r.v}%</div>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/20 dark:bg-white/10 overflow-hidden">
                              <div
                                className={cn('h-full bg-gradient-to-r', r.color)}
                                style={{ width: `${r.v}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {active === 'trips' && (
                <section className="rounded-3xl border border-white/35 bg-white/35 dark:bg-white/5 backdrop-blur-xl shadow-soft p-5">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-extrabold">Your trip progress</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Mocked cards with progress bars.</div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 text-sm font-extrabold hover:bg-white/55 dark:hover:bg-white/10 transition"
                      onClick={() => setActive('saved')}
                    >
                      Saved trips
                    </button>
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {trips.map((t) => (
                      <div key={t.id} className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-soft p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-extrabold">{t.title}</div>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.location}</div>
                            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">ETA: {t.date}</div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-500 font-semibold">
                            {t.tag}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Progress</div>
                            <div className="text-xs font-extrabold">{formatPercent(t.progress)}</div>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white/20 dark:bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-500 to-sky-500" style={{ width: `${t.progress}%` }} />
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            className="flex-1 px-4 py-2 rounded-2xl border border-white/35 bg-white/40 dark:bg-white/5 text-sm font-extrabold hover:bg-white/55 dark:hover:bg-white/10 transition"
                          >
                            Continue
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-2xl border border-brand-500/40 bg-gradient-to-r from-brand-500/20 to-sky-500/15 text-sm font-extrabold text-brand-600 dark:text-brand-300 backdrop-blur-xl hover:brightness-110 transition"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-3 left-0 right-0 px-4 z-50">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/35 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl shadow-soft px-3 py-2">
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  ['overview', 'Home', '✨'],
                  ['saved', 'Saved', '💎'],
                  ['analystics', 'Stats', '📈'],
                  ['trips', 'Trips', '🧳']
                ] as const
              ).map(([key, label, icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={cn(
                    'rounded-2xl border px-3 py-2 transition flex flex-col items-center gap-1',
                    active === key
                      ? 'bg-white/80 dark:bg-white/10 border-white/60 dark:border-white/20 shadow-soft'
                      : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5'
                  )}
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

