export type ProfileStats = {
  saved_trips: number
  destinations: number
  days_planned: number
}

export type UserProfile = {
  id: string
  email: string
  full_name: string
  profile_image?: string
  role: string
  is_email_verified: boolean
  is_active: boolean
  date_joined: string
  last_login?: string | null
  last_logout?: string | null
  last_active?: string | null
  stats: ProfileStats
}

export const getInitials = (fullName?: string) => {
  const char = fullName?.trim()?.charAt(0) || 'U'
  return char.toUpperCase()
}