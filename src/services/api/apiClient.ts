import axios, { type AxiosRequestHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

import { env } from '../../config/env'
import type { AuthSession } from '../authService'
import type { ApiSuccessResponse } from './types'
import { useAuthStore } from '../../store/authStore'
import { normalizeApiError } from './errors'

interface ApiRequestConfig extends InternalAxiosRequestConfig {
  hasRetriedAuth?: boolean
  skipAuthRefresh?: boolean
  skipAuthLogout?: boolean
}

let refreshSessionPromise: Promise<AuthSession> | null = null

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: env.apiTimeoutMs,
})

async function refreshSession(refreshToken: string): Promise<AuthSession> {
  const response = await axios.post<ApiSuccessResponse<AuthSession>, AxiosResponse<ApiSuccessResponse<AuthSession>>>(
    `${env.apiBaseUrl}/auth/refresh`,
    { refreshToken },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: env.apiTimeoutMs,
    },
  )

  return response.data.data
}

function getRefreshSessionPromise(refreshToken: string): Promise<AuthSession> {
  refreshSessionPromise ??= refreshSession(refreshToken).finally(() => {
    refreshSessionPromise = null
  })

  return refreshSessionPromise
}

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type']
    }
  }

  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    return config
  }

  if (typeof config.headers?.set === 'function') {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
    return config
  }

  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${accessToken}`,
  } as AxiosRequestHeaders

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalizedError = normalizeApiError(error)
    const config = error?.config as ApiRequestConfig | undefined

    if (
      normalizedError.statusCode === 401 &&
      config &&
      !config.skipAuthRefresh &&
      !config.hasRetriedAuth
    ) {
      const { refreshToken, setSession } = useAuthStore.getState()

      if (refreshToken) {
        try {
          const session = await getRefreshSessionPromise(refreshToken)

          if (useAuthStore.getState().refreshToken !== refreshToken) {
            return Promise.reject(normalizedError)
          }

          setSession(session)
          config.hasRetriedAuth = true

          return apiClient(config)
        } catch {
          if (!config.skipAuthLogout) {
            useAuthStore.getState().logout()
          }
        }
      }
    }

    if (normalizedError.statusCode === 401 && !config?.skipAuthLogout) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(normalizedError)
  },
)
