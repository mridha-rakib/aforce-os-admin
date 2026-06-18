import type { AxiosResponse } from 'axios'

import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export interface StoredFile {
  bucket: string
  contentType: string
  key: string
  originalName: string
  size: number
  url: string
}

export async function uploadFile(file: File, folder = 'content'): Promise<StoredFile> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await apiClient.post<ApiSuccessResponse<StoredFile>, AxiosResponse<ApiSuccessResponse<StoredFile>>>('/storage/upload', formData)

  return response.data.data
}

export const storageService = {
  uploadFile,
}
