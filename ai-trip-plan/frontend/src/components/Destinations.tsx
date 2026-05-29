import { motion } from 'framer-motion'

const featured = [
  { title: 'Costiera Amalfitana · 6 nights', location: 'Italy', price: 'from $2,400', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Kyoto: The Zen Path', location: 'Japan', price: 'from $2,400', image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Nordic Silence', location: 'Norway', price: 'from $1,900', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' }
]

export default function Destinations() {
  return (
    <section id="popular" className="bg-[#f7f1e8] py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-600">Curated by TripZen intelligence</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Seasonal inspirations</h2>
          </div>
          <button className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition">View all journeys</button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((item) => (
            <motion.article key={item.title} whileHover={{ y: -6 }} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <div className="relative h-72 overflow-hidden">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <div className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.location}</div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.price}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
