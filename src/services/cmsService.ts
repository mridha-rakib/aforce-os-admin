import type { AxiosResponse } from 'axios'
import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export type CmsPageId = 'about-us' | 'privacy-policy' | 'terms-and-conditions'

export interface CmsPageContent {
  content: string
  createdAt: string
  id: string
  pageId: CmsPageId
  path: string
  summary: string
  title: string
  updatedAt: string
}

export interface UpdateCmsPageRequest {
  content: string
  path: string
  summary: string
  title: string
}

export async function listCmsPages(): Promise<CmsPageContent[]> {
  const response = await apiClient.get<ApiSuccessResponse<CmsPageContent[]>, AxiosResponse<ApiSuccessResponse<CmsPageContent[]>>>('/cms/pages')
  return response.data.data
}

export async function getCmsPage(pageId: CmsPageId): Promise<CmsPageContent> {
  const response = await apiClient.get<ApiSuccessResponse<CmsPageContent>, AxiosResponse<ApiSuccessResponse<CmsPageContent>>>(`/cms/pages/${pageId}`)
  return response.data.data
}

export async function updateCmsPage(pageId: CmsPageId, input: UpdateCmsPageRequest): Promise<CmsPageContent> {
  const response = await apiClient.put<ApiSuccessResponse<CmsPageContent>, AxiosResponse<ApiSuccessResponse<CmsPageContent>>>(`/cms/pages/${pageId}`, input)
  return response.data.data
}

export const cmsService = {
  getCmsPage,
  listCmsPages,
  updateCmsPage,
}
