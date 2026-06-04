import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { apiFetch, storeToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import { signupSchema, SignupSchema } from '../lib/validationSchemas'

type TokenResponse = { access_token: string }
const DUPLICATE_EMAIL_MESSAGE = 'This email is already registered. Please login or use a different email.'

function getFieldMessage(fieldError: unknown) {
  return Array.isArray(fieldError) ? fieldError.join('; ') : String(fieldError ?? '')
}

function isDuplicateEmailError(detail: any) {
  const emailMessage = getFieldMessage(detail?.email).toLowerCase()
  const usernameMessage = getFieldMessage(detail?.username).toLowerCase()
  return (
    emailMessage.includes('already registered') ||
    emailMessage.includes('already in use') ||
    usernameMessage.includes('already in use')
  )
}

function mapApiError(err: any) {
  if (!err || !err.status) {
    const msg = String(err?.message || err || '')
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network request failed')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    return 'Please check the information you entered.'
  }

  switch (err.status) {
    case 400:
      return 'Please check the information you entered.'
    case 401:
      return 'Invalid email or password.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'Requested resource could not be found.'
    case 500:
    default:
      return 'Something went wrong on our side. Please try again later.'
  }
}

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
    clearErrors,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: SignupSchema) => {
    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ full_name: data.name, email: data.email, username: data.email, password: data.password }),
      })
      const token = await apiFetch<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: data.email, password: data.password }),
      })
      storeToken(token.access_token)
      login(token.access_token)
      toast.success('Account created successfully! Redirecting...')
      navigate('/planner')
    } catch (e: any) {
      const detail = e?.detail || e
      if (isDuplicateEmailError(detail)) {
        setError('email', { type: 'server', message: DUPLICATE_EMAIL_MESSAGE })
        return
      }

      const mapFieldMessage = (msg: string) => {
        const m = (msg || '').toLowerCase()
        if (m.includes('valid email') || m.includes('invalid email')) return 'Invalid email format'
        if (m.includes('required') && m.includes('name')) return 'Name is required.'
        if (m.includes('password') && m.includes('at least')) return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
        if (m.includes('match') || m.includes('do not match')) return 'Passwords do not match.'
        return msg
      }

      // Check for structured field errors returned by backend
      const fieldErrors = detail?.errors || (detail && (detail.email || detail.errors) ? detail : null)
      if (fieldErrors && typeof fieldErrors === 'object') {
        if (fieldErrors.email) {
          const msg = getFieldMessage(fieldErrors.email)
          setError('email' as any, { type: 'server', message: mapFieldMessage(msg) })
        }
        if (fieldErrors.name) {
          const msg = Array.isArray(fieldErrors.name) ? fieldErrors.name.join('; ') : String(fieldErrors.name)
          setError('name' as any, { type: 'server', message: mapFieldMessage(msg) })
        }
        if (fieldErrors.password) {
          const msg = Array.isArray(fieldErrors.password) ? fieldErrors.password.join('; ') : String(fieldErrors.password)
          setError('password' as any, { type: 'server', message: mapFieldMessage(msg) })
        }
        if (fieldErrors.confirmPassword) {
          const msg = Array.isArray(fieldErrors.confirmPassword) ? fieldErrors.confirmPassword.join('; ') : String(fieldErrors.confirmPassword)
          setError('confirmPassword' as any, { type: 'server', message: mapFieldMessage(msg) })
        }
        const generic = mapApiError(e)
        toast.error(generic)
        setError('root.serverError' as any, { type: 'server', message: generic })
        return
      }

      const friendly = mapApiError(e)
      toast.error(friendly)
      setError('root.serverError' as any, { type: 'server', message: friendly })
    }
  }

  return (
    <div className="min-h-screen premium-bg flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card w-full max-w-md p-6 space-y-4"
      >
        <h1 className="text-3xl font-black">Create account</h1>

        <div>
          <input
            className={`glass-panel w-full px-4 py-3 ${errors.name ? 'border-red-500 border' : ''}`}
            placeholder="Name"
            {...register('name', {
              onChange: () => {
                clearErrors('name')
                clearErrors('root.serverError' as any)
              },
            })}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            className={`glass-panel w-full px-4 py-3 ${errors.email ? 'border-red-500 border' : ''}`}
            placeholder="Email"
            {...register('email', {
              onChange: () => {
                clearErrors('email')
                clearErrors('root.serverError' as any)
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            className={`glass-panel w-full px-4 py-3 ${errors.password ? 'border-red-500 border' : ''}`}
            placeholder="Password"
            {...register('password', {
              onChange: () => {
                clearErrors('password')
                clearErrors('root.serverError' as any)
              },
            })}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            className={`glass-panel w-full px-4 py-3 ${errors.confirmPassword ? 'border-red-500 border' : ''}`}
            placeholder="Confirm Password"
            {...register('confirmPassword', {
              onChange: () => {
                clearErrors('confirmPassword')
                clearErrors('root.serverError' as any)
              },
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root?.serverError && (
          <p className="text-sm text-red-500 mt-1">{(errors.root as any).serverError?.message}</p>
        )}

        <button
          className="premium-button w-full flex items-center justify-center gap-2"
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating...
            </>
          ) : (
            'Sign up'
          )}
        </button>

        <p className="text-sm">
          Already have an account? <Link to="/login" className="font-bold">Login</Link>
        </p>
      </motion.form>

    </div>
  )
}
