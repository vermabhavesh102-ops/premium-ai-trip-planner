export default function Footer() {
  return (
    <footer className="border-t border-[#e4dfd7] bg-[#f6f1ea] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_0.6fr_0.6fr] md:gap-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#142018] text-sm font-black text-[#d5b487] dark:bg-[#d5b487] dark:text-slate-950">
              T
            </span>
            <div className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
              TripZen<span className="font-['Playfair_Display'] italic font-bold text-[#b88954]">AI</span>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
            Bespoke itineraries for the curious and the quiet. Designed for travelers who value
            depth over distance.
          </p>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-500">
            Explore
          </h2>
          <ul className="mt-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <li>Destinations</li>
            <li>How it works</li>
            <li>Sample itinerary</li>
          </ul>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-500">
            Company
          </h2>
          <ul className="mt-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <li>Our ethos</li>
            <li>Privacy</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e4dfd7] dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-[10px] font-medium uppercase tracking-[0.45em] text-slate-500 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>(c) 2026 TripZen AI - Elevated Explorations</p>
          <div className="flex flex-wrap gap-8">
            <span>Instagram</span>
            <span>Substack</span>
            <span>Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
