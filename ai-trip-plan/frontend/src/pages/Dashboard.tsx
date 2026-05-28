import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const savedTrips = (() => {
    try {
      return JSON.parse(localStorage.getItem('saved_trips') ?? '[]') as Array<{ destination?: string; duration_days?: number; savedAt?: string }>
    } catch {
      return []
    }
  })()
  const latestTrip = (() => {
    try {
      return JSON.parse(localStorage.getItem('latest_trip') ?? 'null') as { destination?: string; duration_days?: number } | null
    } catch {
      return null
    }
  })()
  const cards = [
    ['Upcoming adventure', 'Kyoto Spring Journey', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'],
    ['Memory collection', 'Iceland Northern Lights', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80'],
    ['Recommendations', 'Amalfi Coast Escape', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80']
  ]

  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-white pb-28">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/35 dark:bg-slate-950/30 border-b border-white/30 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div><div className="font-black">Travel Workspace</div><div className="text-xs">Welcome, {user?.full_name ?? 'Traveler'}</div></div>
          <div className="flex gap-2 items-center"><Link to="/planner" className="luxury-chip">Planner</Link><Link to="/trip-results" className="luxury-chip">View Itinerary</Link><button onClick={()=>{logout();navigate('/')}} className="luxury-chip">Logout</button><ThemeToggle /></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-5">
        <section className="grid md:grid-cols-3 gap-4">{[[String(savedTrips.length || 14),'Saved journeys'],['6','Upcoming trips'],['24','AI recommendations']].map(([v,t])=><div key={t} className="glass-panel p-5"><div className="text-3xl font-black">{v}</div><div className="text-sm text-slate-600 dark:text-slate-300">{t}</div></div>)}</section>
        <section className="grid md:grid-cols-2 gap-4">
          <article className="glass-card p-4">
            <div className="font-black mb-2">Recently generated trips</div>
            {latestTrip ? <div className="text-sm">{latestTrip.destination} • {latestTrip.duration_days} days</div> : <div className="text-sm text-slate-600 dark:text-slate-300">No recent generation yet.</div>}
            <div className="mt-3"><Link to="/trip-results" className="luxury-chip">View Itinerary</Link></div>
          </article>
          <article className="glass-card p-4">
            <div className="font-black mb-2">Travel collections</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Luxury escapes, mountain retreats, family picks and weekend getaways.</div>
            <div className="mt-3 flex gap-2"><Link to="/planner" className="luxury-chip">Plan new</Link><Link to="/workspace" className="luxury-chip">Workspace</Link></div>
          </article>
        </section>
        <section className="grid md:grid-cols-3 gap-4">{cards.map(([k,t,img])=><motion.article whileHover={{y:-6}} key={t} className="glass-card overflow-hidden"><div className="h-44"><img src={img} alt={t} className="cinematic-image"/></div><div className="p-4"><div className="text-xs text-slate-500">{k}</div><div className="font-black text-lg">{t}</div></div></motion.article>)}</section>
      </main>
      <div className="floating-nav lg:hidden p-2"><div className="grid grid-cols-3 gap-2"><Link to="/dashboard" className="luxury-chip text-center">Home</Link><Link to="/planner" className="luxury-chip text-center">Planner</Link><button onClick={()=>{logout();navigate('/')}} className="luxury-chip">Exit</button></div></div>
    </div>
  )
}
