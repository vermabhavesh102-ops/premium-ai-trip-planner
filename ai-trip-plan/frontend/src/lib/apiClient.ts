const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type JsonValue = any

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('access_token')
  } catch {
    return null
  }
}

function buildHeaders(options: RequestInit = {}, token?: string | null) {
  const headers = new Headers(options.headers)

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const isFormData = options.body instanceof FormData || options.body instanceof URLSearchParams
  if (!headers.has('Content-Type') && options.body != null && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

export async function apiFetch<T = JsonValue>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options, token),
  })

  if (!res.ok) {
    let detail: any = null
    try {
      detail = await res.json()
    } catch {
      detail = await res.text()
    }
    // Extract meaningful error message from various error formats
    let message = `Request failed: ${res.status}`
    if (typeof detail === 'string') {
      message = detail
    } else if (detail?.detail) {
      // FastAPI returns errors in 'detail' field
      if (Array.isArray(detail.detail)) {
        // Validation errors are an array
        message = detail.detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join('; ')
      } else if (typeof detail.detail === 'string') {
        message = detail.detail
      } else if (typeof detail.detail === 'object') {
        message = JSON.stringify(detail.detail)
      }
    } else if (detail?.message) {
      message = detail.message
    } else if (detail?.error) {
      message = typeof detail.error === 'string' ? detail.error : JSON.stringify(detail.error)
    }
    const err = new Error(message) as Error & { status?: number; detail?: any }
    err.status = res.status
    err.detail = detail
    throw err
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function apiPost<T = JsonValue>(path: string, body: unknown, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options
  })
}

export async function apiGet<T = JsonValue>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, { method: 'GET', ...options })
}

export function storeToken(token: string) {
  localStorage.setItem('access_token', token)
}

export function clearToken() {
  localStorage.removeItem('access_token')
}
