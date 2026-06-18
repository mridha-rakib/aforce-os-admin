import type { AxiosResponse } from 'axios'

import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export type AiCoachingStatus = 'Published' | 'Draft' | 'Archived'
export type AiCoachingType = 'Video' | 'Article' | 'Tip'
export type AiCoachingVideoType = 'video/mp4' | 'video/webm' | 'video/quicktime'

export interface AiCoachingAnalytics {
  totalWatchSeconds: number
  uniqueViewers: number
  viewCount: number
}

export interface AiCoachingContent {
  analytics?: AiCoachingAnalytics
  category: string
  createdAt: string
  description: string
  duration: string
  id: string
  publishToApp: boolean
  status: AiCoachingStatus
  title: string
  type: AiCoachingType
  updatedAt: string
  videoKey: string
  videoName: string
  videoSizeBytes: number
  videoType: AiCoachingVideoType
  videoUrl: string
}

export interface ListAiCoachingContentParams {
  category?: string
  search?: string
  status?: AiCoachingStatus
  type?: AiCoachingType
}

export interface CreateAiCoachingContentRequest {
  category: string
  description?: string
  duration?: string
  publishToApp: boolean
  status: AiCoachingStatus
  title: string
  type: AiCoachingType
  videoKey: string
  videoName: string
  videoSizeBytes: number
  videoType: AiCoachingVideoType
  videoUrl: string
}

export type UpdateAiCoachingContentRequest = Partial<CreateAiCoachingContentRequest>

export async function listAiCoachingContent(params?: ListAiCoachingContentParams): Promise<AiCoachingContent[]> {
  const response = await apiClient.get<ApiSuccessResponse<AiCoachingContent[]>, AxiosResponse<ApiSuccessResponse<AiCoachingContent[]>>>(
    '/ai-coaching',
    { params },
  )

  return response.data.data
}

export async function getAiCoachingContent(contentId: string): Promise<AiCoachingContent> {
  const response = await apiClient.get<ApiSuccessResponse<AiCoachingContent>, AxiosResponse<ApiSuccessResponse<AiCoachingContent>>>(
    `/ai-coaching/${contentId}`,
  )

  return response.data.data
}

export async function createAiCoachingContent(input: CreateAiCoachingContentRequest): Promise<AiCoachingContent> {
  const response = await apiClient.post<ApiSuccessResponse<AiCoachingContent>, AxiosResponse<ApiSuccessResponse<AiCoachingContent>>>(
    '/ai-coaching',
    input,
  )

  return response.data.data
}

export async function updateAiCoachingContent(contentId: string, input: UpdateAiCoachingContentRequest): Promise<AiCoachingContent> {
  const response = await apiClient.patch<ApiSuccessResponse<AiCoachingContent>, AxiosResponse<ApiSuccessResponse<AiCoachingContent>>>(
    `/ai-coaching/${contentId}`,
    input,
  )

  return response.data.data
}

export async function deleteAiCoachingContent(contentId: string): Promise<{ contentId: string }> {
  const response = await apiClient.delete<ApiSuccessResponse<{ contentId: string }>, AxiosResponse<ApiSuccessResponse<{ contentId: string }>>>(
    `/ai-coaching/${contentId}`,
  )

  return response.data.data
}

export const aiCoachingService = {
  createAiCoachingContent,
  deleteAiCoachingContent,
  getAiCoachingContent,
  listAiCoachingContent,
  updateAiCoachingContent,
}
