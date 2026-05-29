import { Link } from 'react-router-dom'

const promptChips = [
  'A weekend in Lisbon',
  'Two weeks across Patagonia',
  'Honeymoon in the Maldives',
  'Family trip through Japan',
]

const journeyCards = [
  {
    label: 'Kyoto',
    title: 'Kyoto: The Zen Path',
    subtitle: '7 Days - Cultural immersion - from $2,400',
    image:
      'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cycladic Solitude',
    title: 'Cycladic Solitude',
    subtitle: '10 Days - Coastal retreat - from $3,800',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Nordic Silence',
    title: 'Nordic Silence',
    subtitle: '5 Days - Adventure + spa - from $1,900',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  },
]

const processSteps = [
  {
    numeral: 'I',
    title: 'Describe the feeling',
    detail: 'A mood, a memory, a landscape - anything you can name.',
  },
  {
    numeral: 'II',
    title: 'Receive your draft',
    detail: 'A day-by-day itinerary, illustrated and editable, in under a minute.',
  },
  {
    numeral: 'III',
    title: 'Refine together',
    detail: 'Adjust the pace with our concierge until every hour feels right.',
  },
  {
    numeral: 'IV',
    title: 'Travel beautifully',
    detail: 'We confirm bookings, transfers, and quiet surprises along the way.',
  },
]

const benefits = [
  {
    number: '01',
    title: 'Intelligent curation',
    detail:
      'Our model weighs your pace, palette, and budget against hyper-local intelligence to compose a journey that feels handwritten.',
  },
  {
    number: '02',
    title: 'Concierge on call',
    detail:
      'Reservations, transfers, and last-minute changes are handled by a real travel desk paired with your AI assistant.',
  },
  {
    number: '03',
    title: 'Quiet by design',
    detail:
      'We index independent inns, family ateliers, and seasonal moments the booking giants overlook. No crowds, no checklists.',
  },
]

const timelineEntries = [
  {
    time: '08:30 AM',
    title: 'Private Terrace Breakfast',
    detail:
      'Freshly baked sfogliatella and artisanal coffee as the sun rises over the Positano cliffs. Your local host arranges a quiet table away from the main resort crowds.',
  },
  {
    time: '11:00 AM',
    title: 'Hidden Cove Exploration',
    detail:
      'A private wooden gozzo arrives at the hotel dock. Spend three hours drifting through sea caves and secluded swimming spots only accessible by water.',
  },
  {
    time: '02:30 PM',
    title: 'Lemon Grove Luncheon',
    detail:
      'A family-run agriturismo above Praiano hosts a slow lunch of hand-rolled scialatielli, garden vegetables, and a bottle of Furore Bianco.',
  },
  {
    time: '07:45 PM',
    title: 'Evening at Villa Cimbrone',
    detail:
      'A guided sunset stroll along the Terrace of Infinity, followed by a Michelin-tasting menu reserved months in advance on your behalf.',
  },
]

const testimonials = [
  {
    quote:
      'The itinerary felt less like a logistics sheet and more like a narrative written specifically for me.',
    name: 'Elena Rossi',
    role: 'Visual researcher, Milan',
  },
  {
    quote:
      "Three days into the trip I realized I hadn't opened a single guide. Everything was already exactly where it should be.",
    name: 'Marcus Okafor',
    role: 'Architect, Lagos',
  },
  {
    quote:
      "We've used concierge services for a decade. TripZen replaced them with something more thoughtful and far more personal.",
    name: 'Aiko Tanaka',
    role: 'Gallery director, Kyoto',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#0f1720]">
      <main>
        <section className="px-5 pb-16 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.82fr]">
            <div>
              <p className="inline-flex rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 shadow-sm ring-1 ring-slate-200">
                Now booking for autumn 2026
              </p>

              <div className="mt-6 max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#b88954]">
                  TripZen AI - Autoplanner
                </p>
                <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Travel with{' '}
                  <span className="italic text-[#c47b20]">intelligence</span>, rest with{' '}
                  <span className="italic">intention</span>.
                </h1>
                <p className="mt-6 max-w-lg text-sm leading-7 text-slate-600">
                  TripZen AI crafts bespoke itineraries that balance discovery with tranquility.
                  Tell us what you're imagining.
                </p>
              </div>

              <div className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  className="min-h-12 flex-1 rounded-full border border-slate-300 bg-white px-5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#c49a6c] focus:ring-4 focus:ring-[#d7b98e]/20"
                  placeholder="A 10-day slow-travel journey through Tuscany..."
                  aria-label="Travel prompt"
                />
                <Link
                  to="/planner"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-7 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:bg-slate-800"
                >
                  Generate itinerary
                </Link>
              </div>

              <div className="mt-5 flex max-w-xl flex-wrap gap-3">
                {promptChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-[#c49a6c] hover:text-slate-950"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <figure className="mx-auto w-full max-w-[390px] overflow-hidden rounded-lg bg-slate-950 shadow-[0_34px_95px_-38px_rgba(15,23,42,0.85)]">
              <img
                src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80"
                alt="Traveler overlooking a mountain valley"
                className="aspect-[4/4.25] w-full object-cover"
              />
              <figcaption className="bg-slate-950 px-5 py-4 text-[10px] font-black uppercase tracking-[0.42em] text-[#d5a766]">
                Costiera Amalfitana - 6 nights
              </figcaption>
            </figure>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#c49a6c]">
                  {item.title}
                </p>
                <p className="mt-3 text-xs leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#c47b20]">
                  Curated by TripZen intelligence
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Seasonal inspirations
                </h2>
              </div>
              <Link
                to="/planner"
                className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-950 transition hover:text-[#b88954]"
              >
                View all journeys
              </Link>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {journeyCards.map((journey) => (
                <article
                  key={journey.title}
                  className="group overflow-hidden rounded-lg bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="aspect-[1.25/1] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#c49a6c]">
                      {journey.label}
                    </p>
                    <h3 className="mt-2 text-base font-black text-slate-950">{journey.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{journey.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#e3ded6] bg-[#f7f3ed] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium uppercase tracking-[0.5em] text-slate-700">The process</p>
            <h2 className="mt-4 max-w-4xl font-['Playfair_Display'] text-5xl leading-[0.95] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              Four quiet steps between{' '}
              <span className="italic">idea</span> and{' '}
              <span className="italic text-[#c7a376]">arrival</span>.
            </h2>

            <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step) => (
                <article key={step.title}>
                  <div className="h-1 w-full bg-[#dcd7cf]" />
                  <p className="mt-7 font-['Playfair_Display'] text-2xl italic text-[#c7a376]">
                    {step.numeral}
                  </p>
                  <h3 className="mt-5 font-['Playfair_Display'] text-2xl font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">{step.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-28 grid gap-10 md:grid-cols-3">
              {benefits.map((item) => (
                <article key={item.number}>
                  <div className="h-1 w-full bg-[#e1ddd6]" />
                  <p className="mt-8 text-sm font-medium text-[#b88954]">{item.number}</p>
                  <h3 className="mt-6 font-['Playfair_Display'] text-3xl font-bold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#142018] px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#d5a766]">AI preview</p>
              <h2 className="mt-5 font-['Playfair_Display'] text-5xl font-bold tracking-normal sm:text-6xl">
                A day in Amalfi
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
                A real fragment generated for a recent guest. Times, hosts, and reservations
                confirmed before arrival.
              </p>
            </div>

            <div className="mt-16 space-y-12">
              {timelineEntries.map((entry, index) => (
                <article
                  key={entry.time}
                  className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)] md:gap-16"
                >
                  <div className="relative flex gap-8 md:pl-10">
                    <div className="relative hidden w-4 shrink-0 md:block">
                      <span className="absolute left-1.5 top-2 h-full w-px bg-white/25" />
                      <span className="absolute left-0 top-1 h-4 w-4 rounded-full bg-[#d5b487]" />
                    </div>
                    <div>
                      <p className="font-['Playfair_Display'] text-3xl italic leading-none text-white">
                        {entry.time}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold text-[#e1b46d]">{entry.title}</h3>
                    </div>
                  </div>
                  <p
                    className={`max-w-3xl text-lg leading-8 text-white/75 ${
                      index === timelineEntries.length - 1 ? '' : 'md:pb-2'
                    }`}
                  >
                    {entry.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.45em] text-slate-500">
                From the journal
              </p>
              <h2 className="mt-3 font-['Playfair_Display'] text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                Words from our travelers
              </h2>
            </div>

            <div className="mt-12 grid gap-7 md:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <p className="font-['Playfair_Display'] text-2xl text-[#c49a6c]">"</p>
                  <p className="mt-6 min-h-28 font-['Playfair_Display'] text-lg leading-7 text-slate-950">
                    {item.quote}
                  </p>
                  <div className="mt-8 border-t border-slate-200 pt-5">
                    <p className="text-sm font-bold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.role}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-20 rounded-lg bg-[#142018] px-6 py-20 text-center text-white shadow-2xl shadow-slate-950/10 sm:px-10">
              <h2 className="mx-auto max-w-xl font-['Playfair_Display'] text-4xl font-bold leading-none tracking-normal sm:text-5xl">
                Your next chapter is one{' '}
                <span className="italic text-[#d5b487]">sentence</span> away.
              </h2>
              <p className="mt-6 text-sm font-medium text-white/75">
                Start with a feeling. We'll return an itinerary worth keeping.
              </p>
              <Link
                to="/planner"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d5b487] px-8 text-sm font-bold text-white transition hover:bg-[#caa879]"
              >
                Begin planning
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}
