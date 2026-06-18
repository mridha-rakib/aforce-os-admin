import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { LoadingState } from '../../components/ui/LoadingState'
import { cmsPageOrder, type CmsPageId, useCmsStore } from '../../store/cmsStore'

interface CmsPageProps {
  pageId: CmsPageId
}

export function CmsPage({ pageId }: CmsPageProps) {
  const fetchPage = useCmsStore((state) => state.fetchPage)
  const isLoading = useCmsStore((state) => state.isLoading)
  const page = useCmsStore((state) => state.pages[pageId])

  useEffect(() => {
    void fetchPage(pageId).catch(() => undefined)
  }, [fetchPage, pageId])

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neon">AForce CMS</p>
            <h1 className="mt-3 text-4xl font-bold text-white">{page.title}</h1>
            <p className="mt-2 max-w-2xl text-text-muted">{page.summary}</p>
          </div>
          <Link
            to="/settings"
            className="inline-flex h-11 items-center rounded-xl border border-border bg-panel px-4 text-sm font-semibold text-text-muted transition hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_0.8fr]">
          <Card className="min-h-[540px]">
            {isLoading ? <LoadingState label="Loading CMS page..." /> : <div className="cms-content" dangerouslySetInnerHTML={{ __html: page.content }} />}
          </Card>

          <Card title="Available CMS Pages" subtitle="Each page is editable from the dashboard settings editor.">
            <div className="space-y-3">
              {cmsPageOrder.map((id) => {
                const item = useCmsStore.getState().pages[id]
                return (
                  <Link
                    key={id}
                    to={item.path}
                    className="block rounded-2xl border border-border bg-panel p-4 transition hover:border-slate-600"
                  >
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{item.path}</p>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
