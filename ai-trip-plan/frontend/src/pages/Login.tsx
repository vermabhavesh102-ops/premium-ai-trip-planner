import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch, storeToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

type TokenResponse = { access_token: string }

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const token = await apiFetch<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      })
      storeToken(token.access_token)
      login(token.access_token)
      navigate('/planner')
    } catch (e: any) {
      // Extract detailed error message
      const errorMessage = typeof e === 'string' 
        ? e 
        : e?.message || e?.detail || JSON.stringify(e) || 'Login failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return <div className="min-h-screen premium-bg flex items-center justify-center p-4"><motion.form initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} onSubmit={onSubmit} className="glass-card w-full max-w-md p-6 space-y-4"><h1 className="text-3xl font-black">Welcome back</h1><input className="glass-panel w-full px-4 py-3" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input type="password" className="glass-panel w-full px-4 py-3" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />{error && <div className="text-sm text-red-500">{error}</div>}<button className="premium-button w-full">{loading ? 'Logging in...' : 'Login'}</button><p className="text-sm">No account? <Link to="/signup" className="font-bold">Sign up</Link></p></motion.form></div>
}
