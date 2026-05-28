const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type JsonValue = any

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('access_token')
  } catch {
    return null
  }
}

export async function apiFetch<T = JsonValue>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (!res.ok) {
    let detail: any = null
    try {
      detail = await res.json()
    } catch {
      detail = await res.text()
    }
    const message = typeof detail === 'string' ? detail : detail?.detail ?? `Request failed: ${res.status}`
    const err = new Error(message) as Error & { status?: number }
    err.status = res.status
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
