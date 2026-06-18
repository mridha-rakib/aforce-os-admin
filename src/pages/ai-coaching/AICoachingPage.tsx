import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Eye, FilePenLine, ImageIcon, MoreVertical, Search, Trash2, Upload, Video } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { LoadingState } from '../../components/ui/LoadingState'
import { Spinner } from '../../components/ui/spinner'
import { Toggle } from '../../components/ui/Toggle'
import {
  aiCoachingService,
  type AiCoachingContent,
  type AiCoachingStatus,
  type AiCoachingType,
  type AiCoachingVideoType,
} from '../../services/aiCoachingService'
import { storageService } from '../../services/storageService'

type CoachingView = 'library' | 'upload'
type ContentFilter = 'All Content' | 'Videos' | 'Tips' | 'Articles'

interface CoachingDraft {
  title: string
  description: string
  type: AiCoachingType
  category: string
  status: AiCoachingStatus
  duration: string
  publishToApp: boolean
  videoKey: string
  videoName: string
  videoSizeBytes: number
  videoType: AiCoachingVideoType | ''
  videoUrl: string
}

const maxVideoSizeMb = 50
const maxVideoSizeBytes = maxVideoSizeMb * 1024 * 1024
const allowedVideoTypes: AiCoachingVideoType[] = ['video/mp4', 'video/webm', 'video/quicktime']

const emptyDraft: CoachingDraft = {
  title: '',
  description: '',
  type: 'Video',
  category: 'Recovery',
  status: 'Published',
  duration: '',
  publishToApp: true,
  videoKey: '',
  videoName: '',
  videoSizeBytes: 0,
  videoType: '',
  videoUrl: '',
}

const typeToneMap: Record<AiCoachingType, 'green' | 'yellow' | 'blue'> = {
  Video: 'green',
  Article: 'yellow',
  Tip: 'blue',
}

const statusToneMap: Record<AiCoachingStatus, 'green' | 'red' | 'gray'> = {
  Published: 'green',
  Draft: 'red',
  Archived: 'gray',
}

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatVideoDuration(durationSeconds: number): string {
  const totalSeconds = Math.max(0, Math.round(durationSeconds))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':')
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'AI coaching request failed.'
}

function getVideoDuration(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(objectUrl)
    }

    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const { duration } = video
      cleanup()
      resolve(Number.isFinite(duration) && duration > 0 ? formatVideoDuration(duration) : undefined)
    }
    video.onerror = () => {
      cleanup()
      resolve(undefined)
    }
    video.src = objectUrl
  })
}

function buildPayload(draft: CoachingDraft) {
  return {
    category: draft.category,
    description: draft.description,
    duration: draft.duration,
    publishToApp: draft.publishToApp,
    status: draft.publishToApp ? ('Published' as const) : ('Draft' as const),
    title: draft.title,
    type: 'Video' as const,
    videoKey: draft.videoKey,
    videoName: draft.videoName,
    videoSizeBytes: draft.videoSizeBytes,
    videoType: draft.videoType as AiCoachingVideoType,
    videoUrl: draft.videoUrl,
  }
}

function isAllowedVideoType(type: string): type is AiCoachingVideoType {
  return allowedVideoTypes.includes(type as AiCoachingVideoType)
}

function assertReadyToSave(draft: CoachingDraft): boolean {
  if (!draft.title.trim()) {
    toast.error('Video title is required.')
    return false
  }

  if (!draft.videoKey || !draft.videoUrl || !draft.videoType) {
    toast.error('Upload a video before publishing.')
    return false
  }

  return true
}

export function AICoachingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<AiCoachingContent[]>([])
  const [search, setSearch] = useState('')
  const [contentFilter, setContentFilter] = useState<ContentFilter>('All Content')
  const [newDraft, setNewDraft] = useState<CoachingDraft>(emptyDraft)
  const [isLoading, setLoading] = useState(true)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isUploading, setUploading] = useState(false)
  const view: CoachingView = searchParams.get('mode') === 'upload' ? 'upload' : 'library'

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    void aiCoachingService.listAiCoachingContent()
      .then((content) => {
        if (isMounted) {
          setItems(content)
        }
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = [item.title, item.description, item.category, item.type].join(' ').toLowerCase().includes(search.toLowerCase())
      const matchesFilter =
        contentFilter === 'All Content' ||
        (contentFilter === 'Videos' && item.type === 'Video') ||
        (contentFilter === 'Tips' && item.type === 'Tip') ||
        (contentFilter === 'Articles' && item.type === 'Article')

      return matchesSearch && matchesFilter
    })
  }, [items, search, contentFilter])

  const stats = useMemo(() => {
    const published = items.filter((item) => item.status === 'Published').length
    const videos = items.filter((item) => item.type === 'Video').length
    const drafts = items.filter((item) => item.status === 'Draft').length

    return [
      { label: 'Total Content', value: items.length.toString().padStart(2, '0'), tone: 'green' as const },
      { label: 'Live in App', value: published.toString().padStart(2, '0'), tone: 'green' as const },
      { label: 'Coaching Videos', value: videos.toString().padStart(2, '0'), tone: 'blue' as const },
      { label: 'Draft Queue', value: drafts.toString().padStart(2, '0'), tone: 'yellow' as const },
    ]
  }, [items])

  const uploadVideo = async (file: File | undefined) => {
    if (!file) return

    if (!isAllowedVideoType(file.type)) {
      toast.error('Upload an MP4, WEBM, or MOV video file.')
      return
    }

    if (file.size > maxVideoSizeBytes) {
      toast.error(`Video file must be ${maxVideoSizeMb}MB or smaller.`)
      return
    }

    try {
      setUploading(true)
      const [duration, uploaded] = await Promise.all([
        getVideoDuration(file),
        storageService.uploadFile(file, 'ai-coaching/videos'),
      ])
      const payload = {
        ...(duration ? { duration } : {}),
        type: 'Video' as const,
        videoKey: uploaded.key,
        videoName: uploaded.originalName,
        videoSizeBytes: uploaded.size,
        videoType: uploaded.contentType as AiCoachingVideoType,
        videoUrl: uploaded.url,
      }

      setNewDraft((current) => ({ ...current, ...payload }))
      toast.success('Video uploaded successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const handleUploadSelection = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadVideo(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    void uploadVideo(event.dataTransfer.files[0])
  }

  const createContent = async (event: FormEvent) => {
    event.preventDefault()

    if (!assertReadyToSave(newDraft)) {
      return
    }

    try {
      setSubmitting(true)
      const createdItem = await aiCoachingService.createAiCoachingContent(buildPayload(newDraft))
      setItems((current) => [createdItem, ...current])
      setNewDraft(emptyDraft)
      toast.success('Coaching video published successfully.')
      navigate('/ai-coaching')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteContent = async (item: AiCoachingContent) => {
    if (!window.confirm(`Delete "${item.title}"?`)) {
      return
    }

    try {
      await aiCoachingService.deleteAiCoachingContent(item.id)
      setItems((current) => current.filter((content) => content.id !== item.id))
      toast.success('Coaching content deleted successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="grid gap-6">
      {view === 'library' ? (
        <>
          <section className="grid gap-4 xl:grid-cols-4">
            {stats.map((item, index) => (
              <Card key={item.label} className={index === 0 ? 'bg-[linear-gradient(135deg,rgba(198,255,0,0.14),rgba(14,18,24,1)_52%)]' : undefined}>
                <p className="text-sm text-text-dim">{item.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-4xl font-bold text-white">{item.value}</p>
                  <Badge label={item.label === 'Draft Queue' ? 'Needs review' : 'Healthy'} tone={item.tone} />
                </div>
              </Card>
            ))}
          </section>

          <Card
            title="Content Management"
            subtitle="Manage hydration coaching videos, articles, and tips in one clean publishing workflow."
            action={
              <Button
                className="px-5"
                onClick={() => {
                  setNewDraft(emptyDraft)
                  navigate('/ai-coaching?mode=upload')
                }}
              >
                + Add Content
              </Button>
            }
          >
            <div className="grid gap-4">
              <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
                <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-panel px-4 text-text-muted">
                  <Search className="h-4 w-4" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Search content title"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <Button variant="ghost" className="px-4">
                  Type
                </Button>
                <Button variant="ghost" className="px-4">
                  Status
                </Button>
                <Button variant="ghost" className="px-4">
                  Category
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['All Content', 'Videos', 'Tips', 'Articles'] as ContentFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`h-9 rounded-full px-4 text-xs font-semibold uppercase tracking-wide transition ${
                      contentFilter === filter ? 'bg-neon text-black shadow-neon' : 'border border-border bg-panel text-text-muted hover:text-white'
                    }`}
                    onClick={() => setContentFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-[28px] border border-border bg-card">
                <div className="grid grid-cols-[110px_1.6fr_0.8fr_0.8fr_0.9fr_0.9fr_120px] gap-3 border-b border-border bg-panel px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-dim">
                  <span>Thumbnail</span>
                  <span>Title</span>
                  <span>Type</span>
                  <span>Category</span>
                  <span>Status</span>
                  <span>Date Created</span>
                  <span className="text-right">Actions</span>
                </div>

                <div>
                  {isLoading ? (
                    <div className="border-b border-border px-5 py-10 text-center">
                      <LoadingState label="Loading coaching content..." />
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="border-b border-border px-5 py-10 text-center text-sm text-text-muted">No coaching content found.</div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[110px_1.6fr_0.8fr_0.8fr_0.9fr_0.9fr_120px] gap-3 border-b border-border px-5 py-4 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <div className="grid h-14 w-16 place-items-center rounded-2xl bg-[radial-gradient(circle_at_top,#78a390,#24313d_65%)] text-neon">
                            {item.type === 'Video' ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight text-white">{item.title}</p>
                          <p className="mt-1 truncate text-sm text-text-muted">{item.description || item.videoName}</p>
                        </div>
                        <div className="flex items-center">
                          <Badge label={item.type.toUpperCase()} tone={typeToneMap[item.type]} />
                        </div>
                        <div className="flex items-center text-sm text-text-muted">{item.category}</div>
                        <div className="flex items-center">
                          <Badge label={item.status} tone={statusToneMap[item.status]} />
                        </div>
                        <div className="flex items-center text-sm text-text-muted">{item.createdAt}</div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-border bg-panel p-2 text-text-muted transition hover:text-white"
                            aria-label={`View details for ${item.title}`}
                            onClick={() => navigate(`/ai-coaching/${item.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-border bg-panel p-2 text-text-muted transition hover:text-white"
                            aria-label={`Edit ${item.title}`}
                            onClick={() => navigate(`/ai-coaching/${item.id}/edit`)}
                          >
                            <FilePenLine className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-red-400/25 bg-red-500/10 p-2 text-red-300 transition hover:border-red-300/60 hover:bg-red-500/20"
                            onClick={() => void deleteContent(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button type="button" className="rounded-full border border-border bg-panel p-2 text-text-muted transition hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-[#0e1218] px-5 py-4 text-sm text-text-dim">
                  <div className="flex items-center gap-2">
                    <span>Items per page:</span>
                    <button type="button" className="rounded-full border border-border bg-panel px-3 py-1.5 text-white">
                      20
                    </button>
                  </div>
                  <p>Showing {filteredItems.length > 0 ? `1-${filteredItems.length}` : '0'} of {items.length} items</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card
          title="Upload Coaching Video"
          subtitle="Create new hydration coaching content and publish it directly into the app experience."
          action={
            <Button variant="ghost" className="px-4" onClick={() => navigate('/ai-coaching')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content
            </Button>
          }
        >
          <form className="grid gap-5" onSubmit={createContent}>
            <Input
              label="Video Title"
              placeholder="Post-Workout Hydration Recovery"
              value={newDraft.title}
              onChange={(event) => setNewDraft((current) => ({ ...current, title: event.target.value }))}
              required
            />

            <label className="grid gap-2 text-sm text-text-muted">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Description</span>
              <textarea
                className="min-h-28 rounded-2xl border border-border bg-panel px-4 py-3 text-white outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
                placeholder="Enter video description..."
                maxLength={300}
                value={newDraft.description}
                onChange={(event) => setNewDraft((current) => ({ ...current, description: event.target.value }))}
              />
              <span className="justify-self-end text-xs text-text-dim">{newDraft.description.length}/300</span>
            </label>

            <label className="grid gap-2 text-sm text-text-muted">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Video File</span>
              <div
                className="rounded-[24px] border border-dashed border-border bg-[linear-gradient(180deg,#1a222d,#161d27)] p-8 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neon/10 text-neon">
                  {isUploading ? <Spinner className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
                </div>
                <p className="mt-5 text-xl font-semibold text-white">
                  {isUploading ? 'Uploading Video...' : 'Drag & Drop Video Here'}
                </p>
                <p className="mt-2 text-sm text-text-muted">MP4, WEBM, MOV, max {maxVideoSizeMb}MB</p>
                <label className="mt-5 inline-flex h-10 cursor-pointer items-center rounded-xl border border-neon/20 bg-black/20 px-4 text-sm font-semibold text-neon">
                  Browse Files
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleUploadSelection}
                  />
                </label>
                {newDraft.videoName ? (
                  <div className="mt-5 rounded-2xl border border-border bg-panel px-4 py-3 text-left">
                    <p className="font-semibold text-white">{newDraft.videoName}</p>
                    <p className="text-sm text-text-muted">
                      {formatBytes(newDraft.videoSizeBytes)} uploaded{newDraft.duration ? ` - ${newDraft.duration}` : ''}
                    </p>
                  </div>
                ) : null}
              </div>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-text-muted">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Video Category</span>
                <select
                  className="h-11 rounded-xl border border-border bg-panel px-3 text-white outline-none transition focus:border-neon"
                  value={newDraft.category}
                  onChange={(event) => setNewDraft((current) => ({ ...current, category: event.target.value }))}
                >
                  <option>Recovery</option>
                  <option>Morning</option>
                  <option>Workout</option>
                  <option>Nutrition</option>
                </select>
              </label>

              <Input
                label="Video Duration"
                placeholder="08:42"
                value={newDraft.duration}
                onChange={(event) => setNewDraft((current) => ({ ...current, duration: event.target.value }))}
              />
            </div>

            <div className="rounded-2xl border border-border bg-panel p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Publish to App</p>
                  <p className="text-sm text-text-muted">Make this video visible to all users immediately after upload</p>
                </div>
                <Toggle checked={newDraft.publishToApp} onChange={(next) => setNewDraft((current) => ({ ...current, publishToApp: next }))} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/ai-coaching')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                <span className="inline-flex items-center justify-center gap-2">
                  {isSubmitting ? <Spinner className="text-black" /> : null}
                  Publish Video
                </span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
