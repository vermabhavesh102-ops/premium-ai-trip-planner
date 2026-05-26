import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Placeholder signup
    await new Promise((r) => setTimeout(r, 650))

    window.localStorage.setItem('demoAuth', 'true')
    navigate('/planner')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-soft p-6 md:p-8 backdrop-blur">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-500 via-sky-500 to-brand-400 bg-clip-text text-transparent">
            Create account
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Start planning with AI trip cards.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Name</label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email</label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/40"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Password</label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/40"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-sky-500 px-4 py-3 font-bold text-white shadow-soft hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

