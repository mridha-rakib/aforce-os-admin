export type ApiFieldErrors = Record<string, string[] | undefined>

export interface ApiSuccessResponse<T> {
  data: T
  message: string
  meta?: Record<string, unknown>
  success: true
}

export interface ApiErrorResponse {
  error?: {
    code?: string
    details?: unknown
    hint?: string
  }
  message?: string
  requestId?: string
  success: false
}

export interface NormalizedApiError extends Error {
  code?: string
  details?: unknown
  fieldErrors?: ApiFieldErrors
  isNetworkError: boolean
  requestId?: string
  statusCode?: number
}
