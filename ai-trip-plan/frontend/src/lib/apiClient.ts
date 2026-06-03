// IMPORTANT: This repo contains TWO backends with TWO JWT implementations.
// If you're running the Django app (SimpleJWT), make sure VITE_API_BASE_URL points to that server.
// Otherwise the token format will not match and you’ll see: "Given token not valid for any token type".
//
// Example .env:
//   VITE_API_BASE_URL=http://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'


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
  // Build request URL robustly to avoid duplicated segments like `/api/api/...`
  const buildUrl = (p: string) => {
    const base = (API_BASE_URL ?? '').toString()
    if (!base) return p
    // If base is an absolute URL (starts with http), join carefully
    if (/^https?:\/\//i.test(base)) {
      try {
        const baseUrl = new URL(base)
        const origin = baseUrl.origin
        const basePath = baseUrl.pathname.replace(/\/$/, '')
        // If the requested path already includes the basePath prefix, use origin + path
        if (p.startsWith(basePath)) {
          return origin + p
        }
        return base.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p)
      } catch {
        return base.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p)
      }
    }
    // base is a relative prefix like '/api' or ''
    if (p.startsWith(base)) return p // already includes base, use as-is
    return base.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p)
  }

  const res = await fetch(buildUrl(path), {
    ...options,
    headers: buildHeaders(options, token),
  })

  if (!res.ok) {
    let detail: any = null
    const contentType = res.headers.get('content-type')
    try {
      if (contentType?.includes('application/json')) {
        detail = await res.json()
      } else {
        detail = await res.text()
      }
    } catch {
      detail = null
    }
    // Extract meaningful error message from various error formats
    let message = `Request failed: ${res.status}`
    if (typeof detail === 'string' && detail) {
      message = detail
    } else if (detail?.detail) {
      // Django/DRF returns errors in 'detail' field
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
    // If token is invalid or expired, clear stored token so frontend can recover
    if (res.status === 401) {
      try {
        // best-effort clear
        localStorage.removeItem('access_token')
      } catch {}
    }
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
