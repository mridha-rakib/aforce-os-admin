const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1'
const DEFAULT_API_TIMEOUT_MS = 15000

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = Object.freeze({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
  apiTimeoutMs: parsePositiveInteger(import.meta.env.VITE_API_TIMEOUT_MS, DEFAULT_API_TIMEOUT_MS),
})
