export type LoginFormState = {
  email: string
  password: string
}

export type SignupFormState = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const fullNameRegex = /^[A-Za-z ]+$/

function passwordRuleMessages() {
  return {
    length: 'Password must be at least 8 characters long',
    uppercase: 'Password must contain at least 1 uppercase letter',
    lowercase: 'Password must contain at least 1 lowercase letter',
    number: 'Password must contain at least 1 number',
    special: 'Password must contain at least 1 special character',
  }
}

export function validateEmail(email: string): string {
  const v = email.trim()
  if (!v) return 'Email is required'
  if (!emailRegex.test(v)) return 'Invalid email format'
  return ''
}

export function validateFullName(fullName: string): string {
  const v = fullName.trim()
  if (!v) return 'Full Name is required'
  if (v.length < 3) return 'Full Name must be at least 3 characters'
  if (!fullNameRegex.test(v)) return 'Only alphabets and spaces are allowed'
  return ''
}

export function validatePassword(password: string): string {
  const v = password
  const m = passwordRuleMessages()

  if (!v) return 'Password is required'
  if (v.length < 8) return m.length
  if (!/[A-Z]/.test(v)) return m.uppercase
  if (!/[a-z]/.test(v)) return m.lowercase
  if (!/\d/.test(v)) return m.number
  if (!/[^A-Za-z0-9]/.test(v)) return m.special
  return ''
}

export function validateConfirmPassword(password: string, confirmPassword: string): string {
  if (!confirmPassword) return 'Confirm Password is required'
  if (password !== confirmPassword) return 'Passwords do not match'
  return ''
}

export function validateLoginForm(form: LoginFormState) {
  const errors: Partial<Record<keyof LoginFormState, string>> = {}

  const emailError = validateEmail(form.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(form.password)
  if (passwordError) errors.password = passwordError

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function validateSignupForm(form: SignupFormState) {
  const errors: Partial<Record<keyof SignupFormState, string>> = {}

  const fullNameError = validateFullName(form.fullName)
  if (fullNameError) errors.fullName = fullNameError

  const emailError = validateEmail(form.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(form.password)
  if (passwordError) errors.password = passwordError

  const confirmError = validateConfirmPassword(form.password, form.confirmPassword)
  if (confirmError) errors.confirmPassword = confirmError

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
