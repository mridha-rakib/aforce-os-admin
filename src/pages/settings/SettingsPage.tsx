import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, FileText, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { LoadingState } from '../../components/ui/LoadingState'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { cmsPageOrder, type CmsPageId, useCmsStore } from '../../store/cmsStore'

export function SettingsPage() {
  const pages = useCmsStore((state) => state.pages)
  const fetchPages = useCmsStore((state) => state.fetchPages)
  const isLoading = useCmsStore((state) => state.isLoading)
  const savePage = useCmsStore((state) => state.savePage)
  const [selectedPageId, setSelectedPageId] = useState<CmsPageId>('about-us')
  const [draftContent, setDraftContent] = useState(pages['about-us'].content)

  const selectedPage = pages[selectedPageId]
  const hasUnsavedChanges = draftContent !== selectedPage.content

  const cmsCards = useMemo(() => cmsPageOrder.map((pageId) => pages[pageId]), [pages])

  useEffect(() => {
    void fetchPages().catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to load CMS pages.')
    })
  }, [fetchPages])

  useEffect(() => {
    setDraftContent(pages[selectedPageId].content)
  }, [pages, selectedPageId])

  const handleSelectPage = (pageId: CmsPageId) => {
    setSelectedPageId(pageId)
    setDraftContent(pages[pageId].content)
  }

  const handleSave = () => {
    void savePage(selectedPageId, draftContent)
      .then(() => toast.success('CMS page updated successfully.'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to save CMS page.'))
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-3">
        {cmsCards.map((page) => (
          <button
            key={page.id}
            type="button"
            className={`rounded-2xl border p-5 text-left transition ${
              page.pageId === selectedPageId ? 'border-neon bg-neon/10 shadow-neon' : 'border-border bg-card hover:border-slate-600'
            }`}
            onClick={() => handleSelectPage(page.pageId)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black/30 text-neon">
                <FileText className="h-5 w-5" />
              </div>
              <Badge label={page.pageId === selectedPageId ? 'Editing' : 'Live'} tone={page.pageId === selectedPageId ? 'green' : 'gray'} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{page.title}</h3>
            <p className="mt-2 text-sm text-text-muted">{page.summary}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-text-dim">{page.path}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card
          title={`${selectedPage.title} Editor`}
          subtitle="Format the CMS copy and publish the same content directly into the app pages."
          action={
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" onClick={() => setDraftContent(selectedPage.content)}>
                Reset
              </Button>
              <Button className="inline-flex items-center justify-center whitespace-nowrap" onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save CMS
              </Button>
            </div>
          }
        >
          {isLoading ? <LoadingState label="Loading CMS page..." /> : <RichTextEditor value={draftContent} onChange={setDraftContent} />}
        </Card>

        <div className="grid gap-6">
          <Card title="Page Preview" subtitle="Live preview of the currently selected CMS page">
            <div className="rounded-2xl border border-border bg-panel p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{selectedPage.title}</p>
                  <p className="text-sm text-text-muted">{selectedPage.path}</p>
                </div>
                <a
                  href={selectedPage.path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-3 text-sm font-semibold text-text-muted transition hover:text-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </a>
              </div>
              <div className="cms-content max-h-[360px] overflow-y-auto rounded-2xl border border-border bg-[#0b1118] p-4" dangerouslySetInnerHTML={{ __html: draftContent }} />
            </div>
          </Card>

          <Card title="CMS Publishing Rules">
            <div className="space-y-3 text-sm text-text-muted">
              <p>Use the toolbar to bold text, create headings, add lists, quotes and larger text blocks.</p>
              <p>Saving updates the central CMS store, so the matching app page immediately reflects the same content.</p>
              <p>Open the public route to verify the final output for About Us, Privacy Policy or Terms &amp; Conditions.</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
