import { create } from 'zustand'
import { cmsService, type CmsPageContent, type CmsPageId } from '../services/cmsService'
export type { CmsPageContent, CmsPageId } from '../services/cmsService'

interface CmsState {
  error: string | null
  fetchPage: (id: CmsPageId) => Promise<void>
  fetchPages: () => Promise<void>
  isLoading: boolean
  pages: Record<CmsPageId, CmsPageContent>
  savePage: (id: CmsPageId, content: string) => Promise<CmsPageContent>
}

const defaultPages: Record<CmsPageId, CmsPageContent> = {
  'about-us': {
    content:
      '<h1>About AForce</h1><p>AForce helps teams operate faster with a focused admin experience, real-time visibility and cleaner decision workflows.</p><p>Our mission is to make operational dashboards feel precise, fast and easy to maintain at scale.</p><h2>What We Value</h2><ul><li>Reliable data visibility for every team.</li><li>Fast admin actions without unnecessary friction.</li><li>Interfaces that stay clear as the platform grows.</li></ul>',
    createdAt: '',
    id: 'about-us',
    pageId: 'about-us',
    path: '/about-us',
    summary: 'Share the story, mission and product vision behind AForce.',
    title: 'About Us',
    updatedAt: '',
  },
  'privacy-policy': {
    content:
      '<h1>Privacy Policy</h1><p>AForce collects only the information required to operate the platform, secure accounts and improve service quality.</p><h2>Information We Process</h2><ul><li>Account profile details provided by administrators.</li><li>Operational usage data needed for analytics and support.</li><li>Security logs used to detect abuse and protect the platform.</li></ul><p>We use administrative, technical and organizational safeguards to protect this information.</p>',
    createdAt: '',
    id: 'privacy-policy',
    pageId: 'privacy-policy',
    path: '/privacy-policy',
    summary: 'Define how user data is collected, stored and protected.',
    title: 'Privacy Policy',
    updatedAt: '',
  },
  'terms-and-conditions': {
    content:
      '<h1>Terms &amp; Conditions</h1><p>By accessing AForce, administrators agree to use the dashboard in compliance with applicable law and internal company policy.</p><h2>Acceptable Use</h2><ul><li>Do not misuse platform access or attempt unauthorized changes.</li><li>Keep credentials secure and report suspicious activity promptly.</li><li>Use the platform only for approved business operations.</li></ul><p>AForce may update these terms as the service evolves.</p>',
    createdAt: '',
    id: 'terms-and-conditions',
    pageId: 'terms-and-conditions',
    path: '/terms-and-conditions',
    summary: 'Publish the platform usage terms and legal conditions.',
    title: 'Terms & Conditions',
    updatedAt: '',
  },
}

export const cmsPageOrder: CmsPageId[] = ['about-us', 'privacy-policy', 'terms-and-conditions']

export const useCmsStore = create<CmsState>()((set, get) => ({
  error: null,
  isLoading: false,
  pages: defaultPages,
  fetchPage: async (id) => {
    set({ error: null, isLoading: true })
    try {
      const page = await cmsService.getCmsPage(id)
      set((state) => ({
        pages: {
          ...state.pages,
          [id]: page,
        },
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'CMS request failed.' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  fetchPages: async () => {
    set({ error: null, isLoading: true })
    try {
      const pages = await cmsService.listCmsPages()
      set((state) => ({
        pages: pages.reduce(
          (acc, page) => {
            acc[page.pageId] = page
            return acc
          },
          { ...state.pages } as Record<CmsPageId, CmsPageContent>,
        ),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'CMS request failed.' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  savePage: async (id, content) => {
    set({ error: null })
    const current = get().pages[id]

    try {
      const page = await cmsService.updateCmsPage(id, {
        content,
        path: current.path,
        summary: current.summary,
        title: current.title,
      })

      set((state) => ({
        pages: {
          ...state.pages,
          [id]: page,
        },
      }))

      return page
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'CMS request failed.' })
      throw error
    }
  },
}))
