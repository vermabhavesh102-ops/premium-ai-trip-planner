import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/apiClient'
import type { UserProfile } from '../lib/profile'
import { useAuth } from '../context/AuthContext'
import ProfileAvatar from '../components/ProfileAvatar'
import PasswordInput from '../components/PasswordInput'


type Toast = { tone: 'success' | 'error'; message: string }
type PasswordStep = 'otp' | 'password'



const passwordChecks = (password: string) => [
  password.length >= 8,
  /[A-Z]/.test(password),
  /[a-z]/.test(password),
  /\d/.test(password),
  /[^A-Za-z0-9]/.test(password),
]

export default function Profile() {
  const { user: authUser, refreshMe, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)

  const [imagePreview, setImagePreview] = useState('')
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('otp')
  const [otp, setOtp] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<UserProfile>('/api/auth/profile')
      setProfile(data)
      // Sync global auth state with database data to ensure Navbar and Avatar stay updated
      if (data.full_name !== authUser?.full_name || data.profile_image !== authUser?.profile_image) {
        await refreshMe()
      }
    } catch (error) {
      setToast({ tone: 'error', message: error instanceof Error ? error.message : 'Could not load profile.' })
    } finally {
      setLoading(false)
    }
    // Removed authUser?.full_name from deps to prevent infinite loops
  }, [refreshMe])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const strength = useMemo(() => passwordChecks(newPassword).filter(Boolean).length, [newPassword])


  const openEdit = () => {
    if (!profile) return
    setFullName(profile.full_name || authUser?.full_name || '')

    setImageFile(null)

    setImagePreview(profile.profile_image ?? '')
    setEditOpen(true)
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      let updated = await apiFetch<UserProfile>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: fullName.trim() }), // Ensure payload matches backend expectation
      })

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        updated = await apiFetch<UserProfile>('/api/auth/profile/image', { method: 'POST', body: formData })
      }
      
      // Force a refresh of the global authentication context to update the Navbar and global Avatar immediately
      await refreshMe()
      // Ensure we use the freshly returned data from refreshMe to keep Navbar and Profile in sync
      setProfile(updated)
      
      setEditOpen(false)
      setToast({ tone: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setToast({ tone: 'error', message: error instanceof Error ? error.message : 'Could not update profile.' })
    } finally {
      setSaving(false)
    }
  }

  const startPasswordChange = async () => {
    setPasswordOpen(true)
    setPasswordStep('otp')
    setOtp('')
    setVerificationToken('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordLoading(true)
    try {
      const response = await apiFetch<{ detail: string }>('/api/auth/profile/password/send-otp', { method: 'POST' })
      setToast({ tone: 'success', message: response.detail })
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Could not send OTP.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    try {
      const response = await apiFetch<{ verification_token: string }>('/api/auth/profile/password/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp }),
      })
      setVerificationToken(response.verification_token)
      setPasswordStep('password')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'OTP verification failed.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (strength < 5) {
      setPasswordError('Use at least 8 characters with uppercase, lowercase, number, and special character.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')
    try {
      const response = await apiFetch<{ detail: string }>('/api/auth/profile/password/change', {
        method: 'POST',
        body: JSON.stringify({
          verification_token: verificationToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      })
      setPasswordOpen(false)
      setToast({ tone: 'success', message: response.detail })
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Could not update password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const signOut = () => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    logout()
    navigate('/')
  }

  if (loading && !profile) {
    return <div className="min-h-[70vh] bg-[#f7f3ed] py-20 text-center text-sm font-bold dark:bg-slate-950">Loading profile...</div>
  }

  if (!profile) {
    return <div className="min-h-[70vh] bg-[#f7f3ed] py-20 text-center dark:bg-slate-950">Profile could not be loaded.</div>
  }

  const stats = [
    ['Saved Trips', profile.stats.saved_trips],
    ['Destinations', profile.stats.destinations],
    ['Days Planned', profile.stats.days_planned],
  ]

  return (
    <div className="min-h-[calc(100vh-92px)] bg-[#f7f3ed] px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-8">
      {toast ? (
        <div className={`fixed right-4 top-24 z-[100] rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-xl ${toast.tone === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <ProfileAvatar image={profile.profile_image} fullName={profile.full_name || authUser?.full_name || 'Traveler'} className="h-28 w-28 text-4xl" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9a7650]">Your Profile</p>
                <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-bold capitalize">{profile.full_name || authUser?.full_name || 'Traveler'}</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Signed in as {profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={openEdit} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white dark:bg-[#d5b487] dark:text-slate-950">Edit Profile</button>
              <button type="button" onClick={startPasswordChange} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold dark:border-slate-700">Change Password</button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <article key={label} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-['Playfair_Display'] text-4xl font-bold">{value}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.24em] text-slate-500">{label}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold">Account Information</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ['Full Name', profile.full_name || authUser?.full_name || 'Not set'],
              ['Email Address', profile.email],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#faf7f2] p-5 dark:bg-slate-950">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
                <p className="mt-2 break-words font-semibold capitalize">{value}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={signOut} className="mt-7 rounded-full bg-red-600 px-7 py-3 text-sm font-black text-white transition hover:bg-red-700">Logout</button>
        </section>
      </main>

      {editOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={saveProfile} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-['Playfair_Display'] text-3xl font-bold">Edit Profile</h2>
              <button type="button" onClick={() => setEditOpen(false)} className="text-2xl text-slate-500" aria-label="Close">x</button>
            </div>
            <div className="mt-7 flex flex-col items-center gap-4">
              <ProfileAvatar image={imagePreview} fullName={fullName} className="h-28 w-28 text-4xl" />
              <label className="cursor-pointer rounded-full border border-slate-300 px-5 py-2 text-sm font-bold dark:border-slate-700">
                Choose Profile Picture
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    setImageFile(file)
                    setImagePreview(URL.createObjectURL(file))
                  }}
                />
              </label>
              <p className="text-xs text-slate-500">JPG, PNG, or WebP. Maximum 5 MB.</p>
            </div>
            <div className="mt-7 space-y-5">
              <label className="block text-sm font-bold">
                Full Name
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-[#c7a575] dark:border-slate-700" />
              </label>
              <label className="block text-sm font-bold">
                Email Address
                <input disabled value={profile.email} className="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-950" />
              </label>

            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setEditOpen(false)} className="min-h-12 flex-1 rounded-full border border-slate-300 font-bold dark:border-slate-700">Cancel</button>
              <button disabled={saving} className="min-h-12 flex-1 rounded-full bg-slate-950 font-bold text-white disabled:opacity-50 dark:bg-[#d5b487] dark:text-slate-950">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {passwordOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-['Playfair_Display'] text-3xl font-bold">Change Password</h2>
                <p className="mt-2 text-sm text-slate-500">{passwordStep === 'otp' ? `Enter the OTP sent to ${profile.email}` : 'Create a strong new password.'}</p>
              </div>
              <button type="button" onClick={() => setPasswordOpen(false)} className="text-2xl text-slate-500" aria-label="Close">x</button>
            </div>

            {passwordError ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200">{passwordError}</p> : null}

            {passwordStep === 'otp' ? (
              <form onSubmit={verifyOtp} className="mt-7">
                <label className="block text-sm font-bold">
                  Verification OTP
                  <input required inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#c7a575] dark:border-slate-700" />
                </label>
                <button disabled={passwordLoading || otp.length !== 6} className="mt-6 min-h-12 w-full rounded-full bg-slate-950 font-bold text-white disabled:opacity-50 dark:bg-[#d5b487] dark:text-slate-950">{passwordLoading ? 'Please wait...' : 'Verify OTP'}</button>
                <button type="button" disabled={passwordLoading} onClick={startPasswordChange} className="mt-3 w-full text-sm font-bold text-[#9a7650]">Resend OTP</button>
              </form>
            ) : (
              <form onSubmit={updatePassword} className="mt-7 space-y-5">
                <label className="block text-sm font-bold">
                  New Password
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    inputClassName="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#c7a575] dark:border-slate-700"
                  />
                </label>

                <div>
                  <div className="flex gap-2">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < strength ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />)}</div>
                  <p className="mt-2 text-xs text-slate-500">8+ characters with uppercase, lowercase, number, and special character.</p>
                </div>
                <label className="block text-sm font-bold">
                  Confirm Password
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    inputClassName="mt-2 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#c7a575] dark:border-slate-700"
                  />
                </label>

                <button disabled={passwordLoading} className="min-h-12 w-full rounded-full bg-slate-950 font-bold text-white disabled:opacity-50 dark:bg-[#d5b487] dark:text-slate-950">{passwordLoading ? 'Updating password...' : 'Update Password'}</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
