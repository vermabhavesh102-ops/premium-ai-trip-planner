import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.full_name?.split(' ')[0] ?? 'Traveler'
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 transition ${
      isActive
        ? 'bg-slate-950 text-white shadow-sm shadow-slate-900/10 dark:bg-[#d5b487] dark:text-slate-950'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#f6efe3]/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-amber-100 shadow-lg shadow-slate-900/10 dark:bg-[#d5b487] dark:text-slate-950">T</div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">TripZen<span className="text-amber-600 dark:text-[#d5b487]">AI</span></div>
            <div className="hidden text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 sm:block">AI trip planner</div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/planner" className={navLinkClass}>Planner</NavLink>
          <NavLink to="/workspace" className={navLinkClass}>Workspace</NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
        </nav>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:inline-flex">{displayName}</span>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 hover:bg-slate-800 dark:bg-[#d5b487] dark:text-slate-950"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/10 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
