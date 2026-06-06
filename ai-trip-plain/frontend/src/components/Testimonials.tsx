const testimonials = [
  { name: 'Elena Rossi', role: 'Visual researcher, Milan', text: 'The itinerary felt less like a logistics sheet and more like a narrative written specifically for me.' },
  { name: 'Marcus Okafor', role: 'Architect, Lagos', text: "Three days into the trip I realized I hadn't opened a single guide. Everything was already exactly where it should be." },
  { name: 'Aiko Tanaka', role: 'Gallery director, Kyoto', text: "We've used concierge services for a decade. TripZen replaced them with something more thoughtful and far more personal." }
]

export default function Testimonials() {
  return (
    <section className="bg-[#f7f1e8] py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-600">From the journal</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Words from our travelers</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
              <p className="text-lg leading-8 text-slate-800">“{item.text}”</p>
              <div className="mt-6 text-sm text-slate-500">{item.role}</div>
              <div className="mt-1 font-semibold text-slate-950">{item.name}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
