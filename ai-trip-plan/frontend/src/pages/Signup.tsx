import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch, storeToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'



type TokenResponse = { access_token: string }


export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [full_name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ full_name, email, password, confirm_password: confirmPassword }),
      })



      const token = await apiFetch<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      storeToken(token.access_token)
      login(token.access_token)
      navigate('/planner')
    } catch (e: any) {
      const errorMessage = typeof e === 'string'
        ? e
        : e?.message || e?.detail || JSON.stringify(e) || 'Signup failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen premium-bg flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="glass-card w-full max-w-md p-6 space-y-4"
      >
        <h1 className="text-3xl font-black">Create account</h1>
        <input
          className="glass-panel w-full px-4 py-3"
          placeholder="Name"
          value={full_name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="glass-panel w-full px-4 py-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          className="w-full"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          inputClassName="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#c7a575] dark:border-slate-700"
        />
        <PasswordInput
          className="w-full"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          inputClassName="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#c7a575] dark:border-slate-700"
        />


        {error && <div className="text-sm text-red-500">{error}</div>}
        <button className="premium-button w-full">{loading ? 'Creating...' : 'Sign up'}</button>
        <p className="text-sm">
          Already have an account? <Link to="/login" className="font-bold">Login</Link>
        </p>
      </motion.form>
    </div>
  )
}

