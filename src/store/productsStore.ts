import { create } from 'zustand'
import { productService } from '../services/productService'
import type { Product } from '../types'

interface CreateProductInput {
  name: string
  category: string
  price: number
  stock: number
  status: Product['status']
  image?: string
  description?: string
  benefits?: string[]
}

interface ProductsState {
  error: string | null
  fetchProduct: (id: string) => Promise<Product>
  fetchProducts: () => Promise<void>
  isLoading: boolean
  products: Product[]
  createProduct: (input: CreateProductInput) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  updateProduct: (id: string, input: CreateProductInput) => Promise<Product>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Product request failed.'
}

export const useProductsStore = create<ProductsState>()((set) => ({
  error: null,
  isLoading: false,
  products: [],
  createProduct: async (input) => {
    set({ error: null })

    try {
      const product = await productService.createProduct({
        ...input,
        benefits: input.benefits ?? [],
        description: input.description?.trim() ?? '',
        name: input.name.trim(),
      })

      set((state) => ({ products: [product, ...state.products] }))
      return product
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  deleteProduct: async (id) => {
    set({ error: null })

    try {
      await productService.deleteProduct(id)
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  fetchProduct: async (id) => {
    set({ error: null })

    try {
      const product = await productService.getProduct(id)
      set((state) => ({
        products: state.products.map((item) => (item.id === product.id ? product : item)),
      }))
      return product
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  fetchProducts: async () => {
    set({ error: null, isLoading: true })

    try {
      const products = await productService.listProducts()
      set({ products })
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  updateProduct: async (id, input) => {
    set({ error: null })

    try {
      const product = await productService.updateProduct(id, {
        ...input,
        benefits: input.benefits ?? [],
        description: input.description?.trim() ?? '',
        name: input.name.trim(),
      })

      set((state) => ({
        products: state.products.map((item) => (item.id === product.id ? product : item)),
      }))
      return product
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
}))
