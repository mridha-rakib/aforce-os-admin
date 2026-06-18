import type { AxiosResponse } from 'axios'

import type { ContentItem } from '../types'
import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export interface ListContentParams {
  category?: string
  search?: string
  status?: ContentItem['status']
  type?: ContentItem['type']
}

export interface CreateContentRequest {
  category: string
  mediaKey?: string
  mediaName?: string
  mediaType?: string
  mediaUrl?: string
  status: ContentItem['status']
  subtitle?: string
  thumbnail?: string
  thumbnailKey?: string
  title: string
  type: ContentItem['type']
}

export type UpdateContentRequest = Partial<CreateContentRequest>

export async function listContent(params?: ListContentParams): Promise<ContentItem[]> {
  const response = await apiClient.get<ApiSuccessResponse<ContentItem[]>, AxiosResponse<ApiSuccessResponse<ContentItem[]>>>('/content', { params })

  return response.data.data
}

export async function getContent(contentId: string): Promise<ContentItem> {
  const response = await apiClient.get<ApiSuccessResponse<ContentItem>, AxiosResponse<ApiSuccessResponse<ContentItem>>>(`/content/${contentId}`)

  return response.data.data
}

export async function createContent(input: CreateContentRequest): Promise<ContentItem> {
  const response = await apiClient.post<ApiSuccessResponse<ContentItem>, AxiosResponse<ApiSuccessResponse<ContentItem>>>('/content', input)

  return response.data.data
}

export async function updateContent(contentId: string, input: UpdateContentRequest): Promise<ContentItem> {
  const response = await apiClient.patch<ApiSuccessResponse<ContentItem>, AxiosResponse<ApiSuccessResponse<ContentItem>>>(`/content/${contentId}`, input)

  return response.data.data
}

export async function deleteContent(contentId: string): Promise<{ contentId: string }> {
  const response = await apiClient.delete<ApiSuccessResponse<{ contentId: string }>, AxiosResponse<ApiSuccessResponse<{ contentId: string }>>>(
    `/content/${contentId}`,
  )

  return response.data.data
}

export const contentService = {
  createContent,
  deleteContent,
  getContent,
  listContent,
  updateContent,
}
