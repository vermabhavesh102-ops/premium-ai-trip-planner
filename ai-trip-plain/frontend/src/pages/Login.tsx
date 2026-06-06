import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch, storeToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'


type TokenResponse = { access_token: string }
type ForgotStep = 'email' | 'otp' | 'password'

const passwordChecks = (password: string) => [
  password.length >= 8,
  /[A-Z]/.test(password),
  /[a-z]/.test(password),
  /\d/.test(password),
  /[^A-Za-z0-9]/.test(password),
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const strength = useMemo(() => passwordChecks(newPassword).filter(Boolean).length, [newPassword])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => {
      setCooldown((v) => (v <= 1 ? 0 : v - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldown > 0])

  const startCooldown = () => {
    setCooldown(60)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const token = await apiFetch<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      storeToken(token.access_token)
      login(token.access_token)
      navigate('/planner')
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openForgot = () => {
    setForgotEmail(email)
    setForgotStep('email')
    setOtp('')
    setVerificationToken('')
    setNewPassword('')
    setConfirmPassword('')
    setForgotError('')
    setForgotMessage('')
    setForgotOpen(true)
  }

  const sendOtp = async (event?: FormEvent) => {
    event?.preventDefault()
    if (cooldown > 0) return

    setForgotLoading(true)
    setForgotError('')
    setForgotMessage('')
    try {
      const response = await apiFetch<{ detail: string }>('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      })
      setForgotMessage(response.detail)
      setForgotStep('otp')
      startCooldown()
    } catch (error: any) {
      setForgotError(error?.message || 'Could not send OTP. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault()
    setForgotLoading(true)
    setForgotError('')
    try {
      const response = await apiFetch<{ verification_token: string; detail: string }>('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail, otp }),
      })
      setVerificationToken(response.verification_token)
      setForgotStep('password')
      setForgotMessage(response.detail)
    } catch (error: any) {
      setForgotError(error?.message || 'OTP verification failed.')
    } finally {
      setForgotLoading(false)
    }
  }

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault()
    setForgotError('')
    if (strength < 5) {
      setForgotError('Use at least 8 characters with uppercase, lowercase, number, and special character.')
      return
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.')
      return
    }

    setForgotLoading(true)
    try {
      const response = await apiFetch<{ detail: string }>('/api/auth/forgot-password/change', {
        method: 'POST',
        body: JSON.stringify({
          email: forgotEmail,
          verification_token: verificationToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      })
      setForgotOpen(false)
      setError('')
      setForgotMessage('')
      setEmail(forgotEmail)
      setPassword('')
      // Match the app's “popup/toast message” style from planner/wishlist flows
      window.alert(response.detail)

    } catch (error: any) {
      setForgotError(error?.message || 'Could not update password.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 premium-bg">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="glass-card w-full max-w-md space-y-4 p-6"
      >
        <h1 className="text-3xl font-black">Welcome back</h1>
        <input className="glass-panel w-full px-4 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput
          className="w-full"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          inputClassName="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#c7a575] dark:border-slate-700"
        />

        <div className="flex justify-end">
          <button type="button" onClick={openForgot} className="text-sm font-bold text-[#9a7650] transition hover:text-[#7b5d3d]">
            Forgot Password?
          </button>
        </div>
        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        <button className="premium-button w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="text-sm">No account? <Link to="/signup" className="font-bold">Sign up</Link></p>
      </motion.form>

      {forgotOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-['Playfair_Display'] text-3xl font-bold">Forgot Password</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {forgotStep === 'email' ? 'Enter your registered email address.' : forgotStep === 'otp' ? 'Enter the OTP sent to your email.' : 'Create a new password.'}
                </p>
              </div>
              <button type="button" onClick={() => setForgotOpen(false)} className="text-2xl text-slate-500" aria-label="Close">x</button>
            </div>

            {forgotMessage ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{forgotMessage}</p> : null}
            {forgotError ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200">{forgotError}</p> : null}

            {forgotStep === 'email' ? (
              <form onSubmit={sendOtp} className="mt-7 space-y-5">
                <label className="block text-sm font-bold">
                  Email Address
                  <input required type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-[#c7a575] dark:border-slate-700" />
                </label>
                <button disabled={forgotLoading || cooldown > 0} className="min-h-12 w-full rounded-full bg-slate-950 font-bold text-white disabled:opacity-50 dark:bg-[#d5b487] dark:text-slate-950">
                  {forgotLoading ? 'Sending OTP...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send OTP'}
                </button>
              </form>
            ) : null}

            {forgotStep === 'otp' ? (
              <form onSubmit={verifyOtp} className="mt-7">
                <label className="block text-sm font-bold">
                  Verification OTP
                  <input required inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#c7a575] dark:border-slate-700" />
                </label>
                <button disabled={forgotLoading || otp.length !== 6} className="mt-6 min-h-12 w-full rounded-full bg-slate-950 font-bold text-white disabled:opacity-50 dark:bg-[#d5b487] dark:text-slate-950">
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" disabled={forgotLoading || cooldown > 0} onClick={() => sendOtp()} className="mt-4 w-full text-sm font-bold text-[#9a7650] disabled:text-slate-400">
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
              </form>
            ) : null}

            {forgotStep === 'password' ? (
              <form onSubmit={resetPassword} className="mt-7 space-y-5">
                <label className="block text-sm font-bold">
                  New Password
                  <input required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-[#c7a575] dark:border-slate-700" />
                </label>
                <div>
                  <div className="flex gap-2">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < strength ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />)}</div>
                  <p className="mt-2 text-xs text-slate-500">8+ characters with uppercase, lowercase, number, and special character.</p>
                </div>
                <label className="block text-sm font-bold">
                  Confirm Password
                  <input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-[#c7a575] dark:border-slate-700" />
                </label>
                <button disabled={forgotLoading} className="min-h-12 w-full rounded-full bg-slate-950 font-bold text-white disabled:opacity-50 dark:bg-[#d5b487] dark:text-slate-950">{forgotLoading ? 'Updating...' : 'Update Password'}</button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
