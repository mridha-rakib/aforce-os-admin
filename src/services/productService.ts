import type { AxiosResponse } from 'axios'

import type { Product } from '../types'
import { apiClient } from './api/apiClient'
import type { ApiSuccessResponse } from './api/types'

export interface CreateProductRequest {
  benefits?: string[]
  category: string
  description?: string
  image?: string
  name: string
  price: number
  status: Product['status']
  stock: number
}

export type UpdateProductRequest = Partial<CreateProductRequest>

export async function listProducts(): Promise<Product[]> {
  const response = await apiClient.get<ApiSuccessResponse<Product[]>, AxiosResponse<ApiSuccessResponse<Product[]>>>('/products')

  return response.data.data
}

export async function createProduct(input: CreateProductRequest): Promise<Product> {
  const response = await apiClient.post<ApiSuccessResponse<Product>, AxiosResponse<ApiSuccessResponse<Product>>>('/products', input)

  return response.data.data
}

export async function getProduct(productId: string): Promise<Product> {
  const response = await apiClient.get<ApiSuccessResponse<Product>, AxiosResponse<ApiSuccessResponse<Product>>>(`/products/${productId}`)

  return response.data.data
}

export async function updateProduct(productId: string, input: UpdateProductRequest): Promise<Product> {
  const response = await apiClient.patch<ApiSuccessResponse<Product>, AxiosResponse<ApiSuccessResponse<Product>>>(`/products/${productId}`, input)

  return response.data.data
}

export async function deleteProduct(productId: string): Promise<{ productId: string }> {
  const response = await apiClient.delete<ApiSuccessResponse<{ productId: string }>, AxiosResponse<ApiSuccessResponse<{ productId: string }>>>(
    `/products/${productId}`,
  )

  return response.data.data
}

export const productService = {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
}
