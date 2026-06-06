import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f5ede3] pb-24 pt-10 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,_rgba(220,185,139,0.35),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(247,213,149,0.22),_transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-600 shadow-sm shadow-slate-900/5">
              Now booking for Autumn 2026
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Travel with <span className="font-serif italic text-amber-700">intelligence</span>,<br /> rest with <span className="font-serif italic text-amber-700">intention</span>.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              TripZen AI crafts bespoke itineraries that balance discovery with tranquility. Tell us what you're imagining and we return a refined itinerary worth keeping.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/planner"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5"
              >
                Generate itinerary
              </Link>
              <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">
                View all journeys
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80" alt="Japan" className="h-44 w-full object-cover" />
                <div className="p-5">
                  <div className="text-xs uppercase tracking-[0.35em] text-amber-500">Japan</div>
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">Kyoto: The Zen Path</h2>
                  <p className="mt-2 text-sm text-slate-500">7 Days · Cultural Immersion · from $2,400</p>
                </div>
              </article>
              <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" alt="Greece" className="h-44 w-full object-cover" />
                <div className="p-5">
                  <div className="text-xs uppercase tracking-[0.35em] text-amber-500">Greece</div>
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">Cycladic Solitude</h2>
                  <p className="mt-2 text-sm text-slate-500">10 Days · Coastal Retreat · from $3,800</p>
                </div>
              </article>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
          >
            <div className="grid gap-5 p-8 sm:grid-cols-[1fr]">
              <div className="rounded-[28px] border border-slate-200 bg-[#f8f1e7] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-600">Where to next?</p>
                <h2 className="mt-4 text-3xl font-bold text-slate-950">Search your destination</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Plan the next quiet escape with one quick, elevated request.</p>
              </div>

              <div className="rounded-[28px] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Amalfi" className="h-72 w-full object-cover" />
                <div className="border-t border-slate-200 bg-white p-6">
                  <div className="text-sm text-slate-500">4 days · 2 travelers · mid</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['A weekend in Lisbon', 'Two weeks across Patagonia', 'Honeymoon in the Maldives', 'Family rail trip through Japan'].map((label) => (
                      <button key={label} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
