import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: wire to backend auth
    // For now, just redirect after successful submission.
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="relative w-full max-w-md rounded-3xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-soft p-6 md:p-8 backdrop-blur overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-cyan-400/15 blur-2xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,143,255,0.14),transparent_55%)]" />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-500 via-sky-500 to-brand-400 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Login to generate your next trip.</p>
        </div>


        <form onSubmit={onSubmit} className="space-y-4">
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
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Don’t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

