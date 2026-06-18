import type { AxiosResponse } from 'axios'

import type { SubscriptionType, User, UserDetails, UserStatus } from '../types'
import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export interface ListUsersParams {
  search?: string
  status?: UserStatus
  subscription?: SubscriptionType
}

export interface CreateUserRequest {
  email: string
  hydrationScore?: number
  name: string
  status: UserStatus
  subscription: SubscriptionType
}

export type UpdateUserRequest = Partial<CreateUserRequest>

export async function listUsers(params?: ListUsersParams): Promise<User[]> {
  const response = await apiClient.get<ApiSuccessResponse<User[]>, AxiosResponse<ApiSuccessResponse<User[]>>>('/users', { params })

  return response.data.data
}

export async function getUser(userId: string): Promise<UserDetails> {
  const response = await apiClient.get<ApiSuccessResponse<UserDetails>, AxiosResponse<ApiSuccessResponse<UserDetails>>>(`/users/${userId}`)

  return response.data.data
}

export async function createUser(input: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<ApiSuccessResponse<User>, AxiosResponse<ApiSuccessResponse<User>>>('/users', input)

  return response.data.data
}

export async function updateUser(userId: string, input: UpdateUserRequest): Promise<User> {
  const response = await apiClient.patch<ApiSuccessResponse<User>, AxiosResponse<ApiSuccessResponse<User>>>(`/users/${userId}`, input)

  return response.data.data
}

export async function deleteUser(userId: string): Promise<{ userId: string }> {
  const response = await apiClient.delete<ApiSuccessResponse<{ userId: string }>, AxiosResponse<ApiSuccessResponse<{ userId: string }>>>(
    `/users/${userId}`,
  )

  return response.data.data
}

export const userService = {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
}
