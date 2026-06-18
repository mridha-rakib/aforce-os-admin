import axios, { type AxiosError } from 'axios'

import type { ApiErrorResponse, ApiFieldErrors, NormalizedApiError } from './types'

interface ZodFlattenedError {
  fieldErrors?: ApiFieldErrors
  formErrors?: string[]
}

interface ZodIssue {
  message?: string
  path?: Array<number | string>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractFieldErrors(details: unknown): ApiFieldErrors | undefined {
  if (!isRecord(details)) {
    return undefined
  }

  const flattened = details as ZodFlattenedError

  if (flattened.fieldErrors && isRecord(flattened.fieldErrors)) {
    return flattened.fieldErrors
  }

  const issues = details.issues

  if (!Array.isArray(issues)) {
    return undefined
  }

  return issues.reduce<ApiFieldErrors>((accumulator, issue: ZodIssue) => {
    const path = issue.path?.join('.') || 'form'
    const message = issue.message || 'Invalid value.'
    accumulator[path] = [...(accumulator[path] ?? []), message]
    return accumulator
  }, {})
}

function createNormalizedError(input: Omit<NormalizedApiError, 'name'>): NormalizedApiError {
  return Object.assign(input, {
    name: 'ApiError',
  })
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'

    return createNormalizedError({
      isNetworkError: false,
      message,
    })
  }

  const axiosError = error as AxiosError<ApiErrorResponse>
  const response = axiosError.response
  const payload = response?.data
  const details = payload?.error?.details

  return createNormalizedError({
    code: payload?.error?.code,
    details,
    fieldErrors: extractFieldErrors(details),
    isNetworkError: !response,
    message: payload?.message || axiosError.message || 'Request failed.',
    requestId: payload?.requestId,
    statusCode: response?.status,
  })
}
