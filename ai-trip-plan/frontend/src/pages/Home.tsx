import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const destinations = [
  { name: 'Bali', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Santorini', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' }
]

const partners = ['Booking', 'Skyscanner', 'Tripadvisor', 'Airbnb', 'Google Maps']

export default function Home() {
  const [quickDestination, setQuickDestination] = useState('')
  const faqs = useMemo(
    () => [
      {
        q: 'How fast is AI trip generation?',
        a: 'Most trips generate in a few seconds. You get an itinerary draft you can refine anytime in your Workspace.'
      },
      {
        q: 'Can I edit the plan after it’s generated?',
        a: 'Yes. Save trips to your Dashboard, then edit your day-by-day route, places, and pacing as you like.'
      },
      {
        q: 'Do you work without spreadsheets?',
        a: 'That’s the point—just share what you want, and TripZen AI builds the structure for you.'
      },
      {
        q: 'What do I get in the itinerary?',
        a: 'A day-wise route with suggested activities, plus travel planning helpers for stays, food, transport, and map-ready navigation.'
      },
      {
        q: 'Is my planning private?',
        a: 'Your account keeps your trips organized. Avoid sharing sensitive details in your brief and you’ll stay safe.'
      }
    ],
    []
  )
  const [openFaq, setOpenFaq] = useState<number>(0)

  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/35 dark:bg-slate-950/30 border-b border-white/30 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-black text-lg">TripZen AI</div>
          <div className="flex items-center gap-2">
            <Link to="/planner" className="luxury-chip">Planner</Link>
            <Link to="/workspace" className="luxury-chip">Workspace</Link>
            <Link to="/login" className="luxury-chip">Login</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 space-y-10">
        <section className="grid lg:grid-cols-2 gap-6 items-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <span className="luxury-chip">AI Trip Copilot</span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">From idea to full itinerary in under 60 seconds.</h1>
            <p className="text-slate-700 dark:text-slate-200">
              Plan smarter with destination matching, day-wise routes, hotels, transport, food picks, maps and weather — in one smooth flow.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link to="/planner" className="premium-button">
                Generate Trip
              </Link>
              <div className="glass-panel px-4 py-3 font-bold text-center sm:text-left">
                New here?{' '}
                <Link to="/signup" className="text-brand-500 underline decoration-white/40 underline-offset-2">
                  Create Account
                </Link>
              </div>
            </div>

            <div className="glass-panel p-3 flex flex-col sm:flex-row gap-2">
              <input
                value={quickDestination}
                onChange={(e) => setQuickDestination(e.target.value)}
                placeholder="Quick start: Where do you want to go?"
                className="flex-1 bg-transparent outline-none px-3 py-2 text-sm"
              />
              <Link
                to={`/planner${quickDestination.trim() ? `?destination=${encodeURIComponent(quickDestination.trim())}` : ''}`}
                className="premium-button"
              >
                Start Planning
              </Link>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['No spreadsheets', 'AI day planner', 'Save & edit anytime'].map((t) => <span key={t} className="luxury-chip">{t}</span>)}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 space-y-3">
            <div className="font-black">Try a sample trip brief</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="glass-panel p-3"><div className="text-xs text-slate-500">Destination</div><div className="font-bold">Japan</div></div>
              <div className="glass-panel p-3"><div className="text-xs text-slate-500">Duration</div><div className="font-bold">7 Days</div></div>
              <div className="glass-panel p-3"><div className="text-xs text-slate-500">Budget</div><div className="font-bold">Mid</div></div>
              <div className="glass-panel p-3"><div className="text-xs text-slate-500">Travelers</div><div className="font-bold">2</div></div>
            </div>
            <div className="glass-panel p-3 text-sm">
              <div className="font-bold mb-1">Preview day plan</div>
              <div>09:00 • Shibuya walk</div>
              <div>13:00 • Sushi lunch</div>
              <div>17:00 • Tokyo Skytree sunset</div>
            </div>
            <Link to="/planner" className="premium-button w-full">Start in Planner</Link>
          </motion.div>
        </section>

        <section className="glass-panel p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Trusted travel stack</div>
          <div className="flex flex-wrap gap-2">{partners.map((p) => <span key={p} className="luxury-chip">{p}</span>)}</div>
        </section>

        <section className="overflow-hidden glass-card p-4">
          <div className="text-sm font-bold mb-3">Trending right now</div>
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-2 w-max"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            >
              {[...destinations, ...destinations, ...destinations].map((d, idx) => (
                <Link
                  key={`${d.name}-${idx}`}
                  to={`/planner?destination=${encodeURIComponent(d.name)}`}
                  className="luxury-chip whitespace-nowrap"
                >
                  ✈ {d.name}
                </Link>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            ['1', 'Set preferences', 'Choose destination, budget, duration, interests'],
            ['2', 'AI builds plan', 'Get itinerary, hotels, restaurants and transport'],
            ['3', 'Save & travel', 'Edit, save trip, open maps, track in dashboard']
          ].map(([n, t, d]) => (
            <motion.article key={t} whileHover={{ y: -4 }} className="glass-card p-5">
              <div className="luxury-chip w-fit">Step {n}</div>
              <div className="font-black text-xl mt-2">{t}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{d}</div>
            </motion.article>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Popular destinations</h2>
            <span className="luxury-chip">AI trending picks</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d, i) => (
              <motion.article whileHover={{ y: -6 }} key={d.name} className="glass-card overflow-hidden">
                <div className="h-52 relative">
                  <img className="cinematic-image" src={d.image} alt={d.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white font-extrabold text-xl">{d.name}</div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-300">AI-curated experience</div>
                  <div className="font-bold">0{i + 1}</div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            ['12k+', 'Trips generated'],
            ['4.9★', 'Experience rating'],
            ['2.1s', 'Average generation']
          ].map(([v, t]) => (
            <motion.div key={t} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="glass-panel p-5">
              <div className="text-3xl font-black">{v}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{t}</div>
            </motion.div>
          ))}
        </section>

        <section className="glass-card p-6">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-black">Questions, answered</h2>
              <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">
                Quick clarity before you generate your first itinerary.
              </p>
            </div>
            <span className="luxury-chip">FAQ</span>
          </div>

          <div className="grid gap-3">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={f.q} className="glass-panel p-4">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  >
                    <div className="font-bold">{f.q}</div>
                    <span className="text-brand-500">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">{f.a}</div>}
                </div>
              )
            })}

            <div className="mt-4">
              <Link to="/planner" className="premium-button w-full">
                Generate your first AI itinerary
              </Link>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-slate-600 dark:text-slate-300">
          <div className="font-black">TripZen AI</div>
          <div className="mt-1">© {new Date().getFullYear()} All rights reserved.</div>
        </footer>
      </main>
    </div>
