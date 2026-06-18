import { create } from 'zustand'
import { contentService, type ListContentParams } from '../services/contentService'
import type { ContentItem } from '../types'

interface ContentInput {
  category: string
  mediaName?: string
  mediaType?: string
  status: ContentItem['status']
  subtitle?: string
  thumbnail?: string
  title: string
  type: ContentItem['type']
}

interface ContentState {
  contentItems: ContentItem[]
  createContent: (input: ContentInput) => Promise<ContentItem>
  deleteContent: (id: string) => Promise<void>
  error: string | null
  fetchContent: (params?: ListContentParams) => Promise<void>
  isLoading: boolean
  updateContent: (id: string, input: ContentInput) => Promise<ContentItem>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Content request failed.'
}

export const useContentStore = create<ContentState>()((set) => ({
  contentItems: [],
  error: null,
  isLoading: false,
  createContent: async (input) => {
    set({ error: null })

    try {
      const content = await contentService.createContent({
        ...input,
        category: input.category.trim(),
        subtitle: input.subtitle?.trim() ?? '',
        title: input.title.trim(),
      })

      set((state) => ({ contentItems: [content, ...state.contentItems] }))
      return content
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  deleteContent: async (id) => {
    set({ error: null })

    try {
      await contentService.deleteContent(id)
      set((state) => ({
        contentItems: state.contentItems.filter((item) => item.id !== id),
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  fetchContent: async (params) => {
    set({ error: null, isLoading: true })

    try {
      const contentItems = await contentService.listContent(params)
      set({ contentItems })
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  updateContent: async (id, input) => {
    set({ error: null })

    try {
      const content = await contentService.updateContent(id, {
        ...input,
        category: input.category.trim(),
        subtitle: input.subtitle?.trim() ?? '',
        title: input.title.trim(),
      })

      set((state) => ({
        contentItems: state.contentItems.map((item) => (item.id === content.id ? content : item)),
      }))
      return content
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
}))
