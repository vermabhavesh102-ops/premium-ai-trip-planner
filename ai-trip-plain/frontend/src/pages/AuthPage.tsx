import { FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Input from '../components/ui/Input'
import PasswordInput from '../components/PasswordInput'
import { apiFetch, storeToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateLoginForm,
  validatePassword,
  validateSignupForm,
} from '../lib/authValidation'

type TokenResponse = { access_token: string }
type Mode = 'login' | 'signup'

function inferModeFromPath(pathname: string): Mode {
  if (pathname.includes('/signup')) return 'signup'
  return 'login'
}

export default function AuthPage({ initialMode }: { initialMode?: Mode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [mode, setMode] = useState<Mode>(() => initialMode ?? inferModeFromPath(location.pathname))

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // touched fields for real-time UX
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const loginValidation = useMemo(() => validateLoginForm({ email: loginEmail, password: loginPassword }), [
    loginEmail,
    loginPassword,
  ])
  const signupValidation = useMemo(
    () => validateSignupForm({ fullName, email, password, confirmPassword }),
    [fullName, email, password, confirmPassword]
  )

  const isLoginValid = loginValidation.isValid
  const isSignupValid = signupValidation.isValid


  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setCardError('')
    setSuccessMessage('')

    if (mode === 'login') {
      // Force-touched for visible errors
      setTouched((prev) => ({
        ...prev,
        loginEmail: true,
        loginPassword: true,
      }))

      if (!isLoginValid) return

      setLoading(true)
      try {
        const token = await apiFetch<TokenResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword }),
        })

        storeToken(token.access_token)
        login(token.access_token)

        navigate('/planner', { state: { showLoginSuccess: true } })
      } catch (err: any) {
        setCardError(err?.message || 'Login failed. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // signup
    setTouched((prev) => ({
      ...prev,
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    }))

    if (!isSignupValid) return

    setLoading(true)
    try {
      // Create account
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirm_password: confirmPassword,
        }),
      })

      // Immediately login (matches existing behavior)
      const token = await apiFetch<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      storeToken(token.access_token)
      login(token.access_token)

      setSuccessMessage('Account created successfully. Redirecting…')
      navigate('/planner', { state: { showLoginSuccess: true } })
    } catch (err: any) {
      setCardError(err?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitLabel = mode === 'login' ? (loading ? 'Logging in…' : 'Login') : loading ? 'Signing up…' : 'Sign up'
  const submitDisabled = loading || (mode === 'login' ? !isLoginValid : !isSignupValid)

  const toggleMode = (next: Mode) => {
    setMode(next)
    setCardError('')
    setSuccessMessage('')
    setTouched({})
  }

  const errorOrEmpty = (field: string, error?: string) => {
    if (!error) return ''
    return touched[field] ? error : ''
  }

  // Additional real-time constraints to ensure strict per-field errors:
  const loginEmailError = validateEmail(loginEmail)
  const loginPasswordError = (() => {
    if (!loginPassword.trim()) return 'Password is required'
    if (loginPassword.length < 8) return 'Password must be at least 8 characters'
    const msg = validatePassword(loginPassword)
    return msg
  })()

  const signupFullNameError = validateFullName(fullName)
  const signupEmailError = validateEmail(email)
  const signupPasswordError = validatePassword(password)
  const signupConfirmError = validateConfirmPassword(password, confirmPassword)

  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  return (
    <div className="min-h-screen premium-bg flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="glass-card w-full max-w-md space-y-4 p-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-black">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {mode === 'login' ? 'Login to continue to your planner.' : 'Signup to start building your trips.'}
          </p>
        </div>

        {cardError ? <div className="text-sm font-semibold text-red-500">{cardError}</div> : null}
        {successMessage ? (
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">{successMessage}</div>
        ) : null}

        {mode === 'login' ? (
          <>
            <Input
              label="Email"
              name="email"
              value={loginEmail}
              onChange={(v) => setLoginEmail(v)}
              onBlur={() => setTouched((t) => ({ ...t, loginEmail: true }))}
              placeholder="you@example.com"
              autoComplete="email"
              error={errorOrEmpty('loginEmail', loginEmailError) || undefined}
            />

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">Password</label>
              <div>
                <PasswordInput
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="Password"
                  inputClassName={[
                    'w-full rounded-2xl border bg-transparent px-4 py-3 pr-12 outline-none transition',
                    (touched.loginPassword && loginPasswordError) ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-[#c7a575] dark:border-slate-700',
                  ].join(' ')}
                  name="password"
                  // PasswordInput doesn't forward onBlur, so use wrapper approach:
                />
              </div>
              {touched.loginPassword && loginPasswordError ? (
                <p className="text-xs font-semibold text-red-500">{loginPasswordError}</p>
              ) : null}
              {/* mark touched on blur by mirroring blur to wrapper input via focusout */}
              <div
                tabIndex={-1}
                onBlur={() => setTouched((t) => ({ ...t, loginPassword: true }))}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <>
            <Input
              label="Full Name"
              name="fullName"
              value={fullName}
              onChange={setFullName}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              placeholder="John Doe"
              autoComplete="name"
              error={errorOrEmpty('fullName', signupFullNameError) || undefined}
            />

            <Input
              label="Email"
              name="email"
              value={email}
              onChange={setEmail}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@example.com"
              autoComplete="email"
              error={errorOrEmpty('email', signupEmailError) || undefined}
            />

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">Password</label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                inputClassName={[
                  'w-full rounded-2xl border bg-transparent px-4 py-3 pr-12 outline-none transition',
                  (touched.password && signupPasswordError) ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-[#c7a575] dark:border-slate-700',
                ].join(' ')}
                name="password"
              />
              {touched.password && signupPasswordError ? (
                <p className="text-xs font-semibold text-red-500">{signupPasswordError}</p>
              ) : null}

              <div className="space-y-1">
                <p
                  className={
                    passwordRequirements.length
                      ? 'text-xs text-emerald-600 dark:text-emerald-200'
                      : 'text-xs text-red-500 dark:text-red-300'
                  }
                >
                  {passwordRequirements.length ? '✓' : '✗'} Minimum 8 characters
                </p>
                <p
                  className={
                    passwordRequirements.uppercase
                      ? 'text-xs text-emerald-600 dark:text-emerald-200'
                      : 'text-xs text-red-500 dark:text-red-300'
                  }
                >
                  {passwordRequirements.uppercase ? '✓' : '✗'} One uppercase letter
                </p>
                <p
                  className={
                    passwordRequirements.lowercase
                      ? 'text-xs text-emerald-600 dark:text-emerald-200'
                      : 'text-xs text-red-500 dark:text-red-300'
                  }
                >
                  {passwordRequirements.lowercase ? '✓' : '✗'} One lowercase letter
                </p>
                <p
                  className={
                    passwordRequirements.number
                      ? 'text-xs text-emerald-600 dark:text-emerald-200'
                      : 'text-xs text-red-500 dark:text-red-300'
                  }
                >
                  {passwordRequirements.number ? '✓' : '✗'} One number
                </p>
                <p
                  className={
                    passwordRequirements.special
                      ? 'text-xs text-emerald-600 dark:text-emerald-200'
                      : 'text-xs text-red-500 dark:text-red-300'
                  }
                >
                  {passwordRequirements.special ? '✓' : '✗'} One special character
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm Password"
                inputClassName={[
                  'w-full rounded-2xl border bg-transparent px-4 py-3 pr-12 outline-none transition',
                  signupConfirmError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-[#c7a575] dark:border-slate-700',
                ].join(' ')}
                name="confirmPassword"
              />
              {signupConfirmError ? (
                <p className="text-xs font-semibold text-red-500">{signupConfirmError}</p>
              ) : null}
            </div>

            {/* ensure touched is set on blur for password fields */}
            <div
              tabIndex={-1}
              onBlur={() => setTouched((t) => ({ ...t, password: true, confirmPassword: true }))}
              className="hidden"
            />
          </>
        )}

        <button
          className="premium-button w-full disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          disabled={submitDisabled}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              {submitLabel}
            </span>
          ) : (
            submitLabel
          )}
        </button>

        <div className="pt-2 text-center text-sm">
          {mode === 'login' ? (
            <span>
              No account?{' '}
              <button type="button" className="font-bold text-[#9a7650] transition hover:text-[#7b5d3d]" onClick={() => toggleMode('signup')}>
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" className="font-bold text-[#9a7650] transition hover:text-[#7b5d3d]" onClick={() => toggleMode('login')}>
                Login
              </button>
            </span>
          )}
        </div>

        {/* optional: keep links for non-JS navigation parity */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <Link to="/signup" className="underline underline-offset-2">
              Go to signup page
            </Link>
          ) : (
            <Link to="/login" className="underline underline-offset-2">
              Go to login page
            </Link>
          )}
        </div>
      </motion.form>
    </div>
  )
}
