import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/apiClient'
import type { UserProfile } from '../lib/profile'
import { readSavedTrips } from '../lib/tripStorage'
import ProfileAvatar from './ProfileAvatar'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const theme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'
  const savedTripsCount = profile?.stats.saved_trips ?? readSavedTrips().length
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 transition ${
      isActive
        ? 'bg-slate-950 text-white shadow-sm shadow-slate-900/10 dark:bg-[#d5b487] dark:text-slate-950'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  useEffect(() => {
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const openProfileMenu = () => {
    const nextOpen = !profileOpen
    setProfileOpen(nextOpen)
    if (!nextOpen || profileLoading) return

    setProfileLoading(true)
    apiFetch<UserProfile>('/api/auth/profile')
      .then(setProfile)
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }

  const signOut = () => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#f6efe3]/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="group flex items-center gap-3" aria-label="TripZenAI home">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#142018] to-[#2e3b2f] text-base font-black text-[#f7deb2] shadow-lg shadow-slate-900/15 ring-1 ring-white/20 transition group-hover:-translate-y-0.5 group-hover:shadow-xl dark:from-[#d5b487] dark:via-[#e5cda3] dark:to-[#9a7650] dark:text-slate-950">
            <span className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-[#d5b487]/25 blur-sm" />
            <span className="relative tracking-tight">T</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">TripZen<span className="text-amber-600 dark:text-[#d5b487]">AI</span></div>
            <div className="hidden text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 sm:block">Smart travel guide</div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/planner" className={navLinkClass}>Planner</NavLink>
          <NavLink to="/workspace" end className={navLinkClass}>Wish List</NavLink>
          <NavLink
            to="/trip-results"
            className={({ isActive }) =>
              navLinkClass({ isActive: isActive || location.pathname.startsWith('/workspace/itinerary/') })
            }
          >
            AI Travel Guide
          </NavLink>

        </nav>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <ThemeToggle />
          {user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={openProfileMenu}
                className="rounded-full transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#d5b487]/25"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <ProfileAvatar
                  image={profile?.profile_image ?? user.profile_image}
                  fullName={profile?.full_name ?? user.full_name}
                  className="h-11 w-11 text-sm"
                />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-14 z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-[28px] border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  <div className="flex items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-700">
                    <ProfileAvatar
                      image={profile?.profile_image ?? user.profile_image}
                      fullName={profile?.full_name ?? user.full_name}
                      className="h-16 w-16 text-xl"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xl font-black">{profile?.full_name || user.full_name || 'Traveler'}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {profileLoading ? 'Refreshing profile...' : 'Signed in'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-[#faf7f2] p-4 dark:border-slate-700 dark:bg-slate-950">
                      <p className="font-['Playfair_Display'] text-2xl font-bold">{savedTripsCount}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Saved Trips</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#faf7f2] p-4 dark:border-slate-700 dark:bg-slate-950">
                      <p className="font-['Playfair_Display'] text-2xl font-bold">{theme}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Theme</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="mt-5 flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-bold transition hover:border-[#d5b487] hover:bg-[#faf7f2] dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    View Full Profile
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-3 min-h-11 w-full rounded-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link to="/Signup" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/10 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
