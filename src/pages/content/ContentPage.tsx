import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Eye, FileText, Lightbulb, Pencil, PlayCircle, Trash2, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LoadingState } from '../../components/ui/LoadingState'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/spinner'
import { Table } from '../../components/ui/Table'
import { Toggle } from '../../components/ui/Toggle'
import { storageService } from '../../services/storageService'
import { useContentStore } from '../../store/contentStore'
import type { ContentItem } from '../../types'

type ContentTypeFilter = ContentItem['type'] | 'All'

type ContentDraft = {
  category: string
  mediaKey: string
  mediaName: string
  mediaType: string
  mediaUrl: string
  status: ContentItem['status']
  subtitle: string
  thumbnail: string
  thumbnailKey: string
  title: string
  type: ContentItem['type']
}

const MAX_UPLOAD_MB = 50
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
const acceptedMediaTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
const typeTabs: Array<{ label: string; value: ContentTypeFilter }> = [
  { label: 'All Content', value: 'All' },
  { label: 'Videos', value: 'Video' },
  { label: 'Tips', value: 'Tip' },
  { label: 'Articles', value: 'Article' },
]
const contentTableColumnWidths = ['108px', '38%', '110px', '140px', '130px', '130px', '120px']

const emptyDraft: ContentDraft = {
  category: 'Morning',
  mediaKey: '',
  mediaName: '',
  mediaType: '',
  mediaUrl: '',
  status: 'Draft',
  subtitle: '',
  thumbnail: '',
  thumbnailKey: '',
  title: '',
  type: 'Video',
}

function getContentErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Content request failed.'
}

function contentToDraft(item: ContentItem): ContentDraft {
  return {
    category: item.category,
    mediaKey: item.mediaKey ?? '',
    mediaName: item.mediaName ?? '',
    mediaType: item.mediaType ?? '',
    mediaUrl: item.mediaUrl ?? '',
    status: item.status,
    subtitle: item.subtitle ?? '',
    thumbnail: item.thumbnail ?? '',
    thumbnailKey: item.thumbnailKey ?? '',
    title: item.title,
    type: item.type,
  }
}

function draftToPayload(draft: ContentDraft) {
  return {
    category: draft.category,
    mediaKey: draft.mediaKey,
    mediaName: draft.mediaName,
    mediaType: draft.mediaType,
    mediaUrl: draft.mediaUrl,
    status: draft.status,
    subtitle: draft.subtitle,
    thumbnail: draft.thumbnail,
    thumbnailKey: draft.thumbnailKey,
    title: draft.title,
    type: draft.type,
  }
}

function isPreviewableImage(item: ContentItem | ContentDraft): boolean {
  return Boolean(item.thumbnail && item.mediaType?.startsWith('image/'))
}

function ContentThumbnail({ item }: { item: ContentItem }) {
  if (isPreviewableImage(item) && item.thumbnail) {
    return <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
  }

  const Icon = item.type === 'Video' ? PlayCircle : item.type === 'Tip' ? Lightbulb : FileText

  return <Icon className="h-5 w-5 text-text-muted" />
}

function ContentTitleCell({ item }: { item: ContentItem }) {
  const Icon = item.type === 'Video' ? PlayCircle : item.type === 'Tip' ? Lightbulb : FileText
  const description = item.subtitle || item.mediaName || 'No description'

  return (
    <div className="flex min-w-0 max-w-[460px] items-start gap-2.5">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-panel/80 text-neon">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-5 text-white" title={item.title}>
          {item.title}
        </p>
        <p className="content-title-copy mt-1 text-xs leading-5 text-text-muted" title={description}>
          {description}
        </p>
      </div>
    </div>
  )
}

function ContentFormModal({
  draft,
  isOpen,
  isSubmitting = false,
  onClose,
  onDraftChange,
  onSubmit,
  title,
}: {
  draft: ContentDraft
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onDraftChange: (next: ContentDraft) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  title: string
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setUploading] = useState(false)
  const canSave = draft.title.trim().length > 0 && !isSubmitting && !isUploading

  const applyFile = async (file: File | undefined) => {
    if (!file) {
      return
    }

    if (!acceptedMediaTypes.includes(file.type)) {
      toast.error('Upload a PNG, JPG, or PDF file.')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`Upload files must be ${MAX_UPLOAD_MB}MB or smaller.`)
      return
    }

    try {
      setUploading(true)
      const storedFile = await storageService.uploadFile(file, `content/${draft.type.toLowerCase()}`)
      const isImage = file.type.startsWith('image/')

      onDraftChange({
        ...draft,
        mediaName: file.name,
        mediaType: file.type,
        mediaUrl: storedFile.url,
        mediaKey: storedFile.key,
        thumbnail: isImage ? storedFile.url : '',
        thumbnailKey: isImage ? storedFile.key : '',
      })
      toast.success('File uploaded successfully.')
    } catch (error) {
      toast.error(getContentErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void applyFile(event.target.files?.[0])
    event.target.value = ''
  }

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    void applyFile(event.dataTransfer.files[0])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="Title" value={draft.title} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} required />

        <label className="grid gap-2 text-sm text-text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Description</span>
          <textarea
            className="min-h-24 rounded-xl border border-border bg-panel p-3 text-white outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
            value={draft.subtitle}
            onChange={(event) => onDraftChange({ ...draft, subtitle: event.target.value })}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Category</span>
            <input
              className="h-11 rounded-xl border border-border bg-panel px-3 text-white outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
              value={draft.category}
              onChange={(event) => onDraftChange({ ...draft, category: event.target.value })}
            />
          </label>
          <div className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Status</span>
            <div className="flex h-11 items-center justify-between rounded-xl border border-border bg-panel px-3">
              <span className="text-sm text-text-muted">Published</span>
              <Toggle checked={draft.status === 'Published'} onChange={(next) => onDraftChange({ ...draft, status: next ? 'Published' : 'Draft' })} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          disabled={isUploading}
          className="grid min-h-20 w-full place-items-center rounded-xl border border-dashed border-border p-5 text-center text-text-muted transition hover:border-neon/60 hover:text-white"
        >
          {isUploading ? (
            <LoadingState label="Uploading file..." />
          ) : draft.mediaName ? (
            <span className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-neon" />
              {draft.mediaName}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" />
              Click to upload or drag and drop PNG, JPG, WEBP, MP4, WEBM, PDF (max {MAX_UPLOAD_MB}MB)
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave}>
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner className="text-black" /> : null}
              Save Changes
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function ContentPage() {
  const navigate = useNavigate()
  const contentItems = useContentStore((state) => state.contentItems)
  const createContent = useContentStore((state) => state.createContent)
  const deleteContent = useContentStore((state) => state.deleteContent)
  const fetchContent = useContentStore((state) => state.fetchContent)
  const isLoading = useContentStore((state) => state.isLoading)
  const updateContent = useContentStore((state) => state.updateContent)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<ContentDraft>(emptyDraft)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>('All')

  useEffect(() => {
    void fetchContent().catch((error) => {
      toast.error(getContentErrorMessage(error))
    })
  }, [fetchContent])

  const filtered = useMemo(
    () =>
      contentItems.filter((item) => {
        const matchesType = typeFilter === 'All' || item.type === typeFilter
        const matchesSearch = [item.title, item.subtitle, item.category].join(' ').toLowerCase().includes(search.toLowerCase())

        return matchesType && matchesSearch
      }),
    [contentItems, search, typeFilter],
  )

  const closeAddModal = () => {
    setDraft(emptyDraft)
    setAdding(false)
  }

  const closeEditModal = () => {
    setDraft(emptyDraft)
    setEditing(null)
  }

  const openEditor = (item: ContentItem) => {
    setEditing(item)
    setDraft(contentToDraft(item))
  }

  const onAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      await createContent(draftToPayload(draft))
      toast.success('Content added successfully.')
      closeAddModal()
    } catch (error) {
      toast.error(getContentErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const onEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editing) {
      return
    }

    try {
      setSubmitting(true)
      await updateContent(editing.id, draftToPayload(draft))
      toast.success('Content updated successfully.')
      closeEditModal()
    } catch (error) {
      toast.error(getContentErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <Input placeholder="Search content title" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Button variant="ghost">Type</Button>
        <Button variant="ghost">Status</Button>
        <Button variant="ghost">Category</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={typeFilter === tab.value ? 'primary' : 'ghost'}
            className="h-9 px-3"
            onClick={() => setTypeFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
        <div className="ml-auto">
          <Button onClick={() => setAdding(true)}>+ Add Content</Button>
        </div>
      </div>

      <Table
        columns={['Thumbnail', 'Title', 'Type', 'Category', 'Status', 'Date Created', 'Actions']}
        columnWidths={contentTableColumnWidths}
        tableClassName="table-fixed"
      >
        {isLoading ? (
          <tr className="border-t border-border">
            <td className="px-4 py-8 text-center text-text-muted" colSpan={7}>
              <LoadingState label="Loading content..." />
            </td>
          </tr>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <tr className="border-t border-border">
            <td className="px-4 py-8 text-center text-text-muted" colSpan={7}>
              No content found.
            </td>
          </tr>
        ) : null}

        {!isLoading
          ? filtered.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="grid h-10 w-14 place-items-center overflow-hidden rounded-lg bg-panel">
                    <ContentThumbnail item={item} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ContentTitleCell item={item} />
                </td>
                <td className="px-4 py-3">
                  <Badge label={item.type.toUpperCase()} tone="green" />
                </td>
                <td className="px-4 py-3 text-text-muted">{item.category}</td>
                <td className="px-4 py-3">
                  <Badge label={item.status} tone={item.status === 'Published' ? 'green' : item.status === 'Draft' ? 'red' : 'gray'} />
                </td>
                <td className="px-4 py-3 text-text-muted">{item.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`View details for ${item.title}`}
                      title="View details"
                      onClick={() => navigate(`/content/${item.id}`)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-panel text-text-muted transition hover:border-neon/60 hover:text-neon"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${item.title}`}
                      title="Edit content"
                      onClick={() => openEditor(item)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-panel text-text-muted transition hover:border-neon/60 hover:text-neon"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${item.title}`}
                      title="Delete content"
                      onClick={() => {
                        if (!window.confirm(`Delete "${item.title}"?`)) {
                          return
                        }

                        void deleteContent(item.id)
                          .then(() => toast.success('Content deleted successfully.'))
                          .catch((error) => toast.error(getContentErrorMessage(error)))
                      }}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-300 transition hover:border-red-300/60 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          : null}
      </Table>

      <div className="flex items-center justify-between text-sm text-text-dim">
        <p>Items per page: 20</p>
        <p>
          Showing {filtered.length > 0 ? `1-${filtered.length}` : '0'} of {contentItems.length} items
        </p>
      </div>

      <ContentFormModal
        draft={draft}
        isOpen={adding}
        isSubmitting={isSubmitting}
        onClose={closeAddModal}
        onDraftChange={setDraft}
        onSubmit={onAdd}
        title="New Content"
      />

      <ContentFormModal
        draft={draft}
        isOpen={Boolean(editing)}
        isSubmitting={isSubmitting}
        onClose={closeEditModal}
        onDraftChange={setDraft}
        onSubmit={onEdit}
        title="Edit Content"
      />
    </div>
  )
}
