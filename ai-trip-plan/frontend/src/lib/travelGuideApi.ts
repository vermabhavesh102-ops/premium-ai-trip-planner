const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL ?? 'http://localhost:8001'

export async function generateTravelGuide<T>(trip: T): Promise<T> {
  const response = await fetch(`${FASTAPI_BASE_URL.replace(/\/$/, '')}/api/ai/travel-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip }),
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.detail ?? `AI travel guide request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
