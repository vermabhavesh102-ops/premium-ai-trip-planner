import { motion } from 'framer-motion'

const steps = [
  { number: 'I', title: 'Describe the feeling', description: 'A mood, a memory, a landscape — anything you can name.' },
  { number: 'II', title: 'Receive your draft', description: 'A day-by-day itinerary, illustrated in under a minute.' },
  { number: 'III', title: 'Refine together', description: 'Adjust the pace with our concierge until every hour feels right.' },
  { number: 'IV', title: 'Travel beautifully', description: 'We confirm bookings, transfers, and quiet surprises along the way.' }
]

export default function Features() {
  return (
    <section id="features" className="bg-[#f7f1e8] py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-600">The process</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Four quiet steps between idea and arrival.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <motion.article key={step.number} whileHover={{ y: -5 }} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
              <div className="text-3xl font-black text-amber-700">{step.number}</div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
