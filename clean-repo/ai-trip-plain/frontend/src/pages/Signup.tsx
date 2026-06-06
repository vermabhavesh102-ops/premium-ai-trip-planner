import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch, storeToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateSignupPayload = ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) => {
  const errors: string[] = []
  if (!name.trim()) errors.push('Name is required')
  if (!email.trim()) errors.push('Email is required')
  else if (!emailRegex.test(email.trim().toLowerCase())) errors.push('Invalid email format')
  if (!password) errors.push('Password is required')
  if (password.length > 0 && password.length < 8) errors.push('Password must be at least 8 characters long')
  if (password && !/[A-Z]/.test(password)) errors.push('Password must contain at least 1 uppercase letter')
  if (password && !/[a-z]/.test(password)) errors.push('Password must contain at least 1 lowercase letter')
  if (password && !/\d/.test(password)) errors.push('Password must contain at least 1 number')
  if (password && !/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least 1 special character')
  if (!confirmPassword) errors.push('Confirm Password is required')
  if (password && confirmPassword && password !== confirmPassword) errors.push('Passwords do not match')
  return errors
}


type TokenResponse = { access_token: string }


export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const emailIsValid = useMemo(
    () => emailRegex.test(email.trim().toLowerCase()),
    [email],
  )

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors([])

    const payload = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    }

    const errors = validateSignupPayload(payload)
    if (errors.length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ full_name: payload.name, email: payload.email, password, confirm_password: confirmPassword }),
      })

      // Immediately attempt login to get the access token
      const token = await apiFetch<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: payload.email, password }),
      })

      const toastState = {
        title: 'Signup Successful',
        description: 'Your account is ready. Enjoy TripZenAI!',
        tone: 'success' as const,
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('tripzenai_toast', JSON.stringify(toastState))
      }

      storeToken(token.access_token)
      login(token.access_token)
      navigate('/planner', { state: { toast: toastState } })
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
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="email"
          className="glass-panel w-full px-4 py-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email ? (
          <p className={`text-xs ${emailIsValid ? 'text-emerald-500' : 'text-red-500'}`}>
            {emailIsValid ? 'Email looks valid.' : 'Enter a valid email address.'}
          </p>
        ) : null}
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


        {fieldErrors.length > 0 ? (
          <div className="space-y-1 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
            {fieldErrors.map((fieldError) => (
              <div key={fieldError}>• {fieldError}</div>
            ))}
          </div>
        ) : null}
        {error && <div className="text-sm text-red-500">{error}</div>}
        <button className="premium-button w-full">{loading ? 'Creating...' : 'Sign up'}</button>
        <p className="text-sm">
          Already have an account? <Link to="/login" className="font-bold">Login</Link>
        </p>
      </motion.form>
    </div>
  )
}
