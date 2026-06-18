import type { AxiosResponse } from 'axios'

import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export type UserRole = 'admin' | 'user' | string

export interface AuthUser {
  avatarUrl?: string
  displayName?: string
  email: string
  emailVerified: boolean
  firstName?: string
  id: string
  lastName?: string
  providers?: {
    apple: boolean
    google: boolean
    password: boolean
  }
  role: UserRole
}

export interface AuthSession {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export async function login(input: LoginRequest): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccessResponse<AuthSession>, AxiosResponse<ApiSuccessResponse<AuthSession>>>('/auth/login', input, {
    skipAuthRefresh: true,
    skipAuthLogout: true,
  })

  return response.data.data
}

export async function refreshSession(refreshToken: string): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccessResponse<AuthSession>, AxiosResponse<ApiSuccessResponse<AuthSession>>>(
    '/auth/refresh',
    { refreshToken },
    { skipAuthRefresh: true, skipAuthLogout: true },
  )

  return response.data.data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken }, { skipAuthLogout: true })
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<ApiSuccessResponse<AuthUser>, AxiosResponse<ApiSuccessResponse<AuthUser>>>('/auth/me')

  return response.data.data
}

export const authService = {
  getCurrentUser,
  login,
  logout,
  refreshSession,
}
