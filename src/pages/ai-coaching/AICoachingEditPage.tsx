import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Upload, Video } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'AI coaching request failed.'
}

function isAllowedVideoType(type: string): type is AiCoachingVideoType {
  return allowedVideoTypes.includes(type as AiCoachingVideoType)
}

function mapContentToDraft(item: AiCoachingContent): CoachingDraft {
  return {
    title: item.title,
    description: item.description,
    type: item.type,
    category: item.category,
    status: item.status,
    duration: item.duration,
    publishToApp: item.publishToApp,
    videoKey: item.videoKey,
    videoName: item.videoName,
    videoSizeBytes: item.videoSizeBytes,
    videoType: item.videoType,
    videoUrl: item.videoUrl,
  }
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

function assertReadyToSave(draft: CoachingDraft): boolean {
  if (!draft.title.trim()) {
    toast.error('Video title is required.')
    return false
  }

  if (!draft.videoKey || !draft.videoUrl || !draft.videoType) {
    toast.error('Upload a video before saving.')
    return false
  }

  return true
}

export function AICoachingEditPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<CoachingDraft>(emptyDraft)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isUploading, setUploading] = useState(false)

  useEffect(() => {
    if (!contentId) {
      setError('Content id is missing.')
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    void aiCoachingService.getAiCoachingContent(contentId)
      .then((content) => {
        if (isMounted) {
          setDraft(mapContentToDraft(content))
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(getErrorMessage(loadError))
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [contentId])

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

      setDraft((current) => ({
        ...current,
        ...(duration ? { duration } : {}),
        type: 'Video',
        videoKey: uploaded.key,
        videoName: uploaded.originalName,
        videoSizeBytes: uploaded.size,
        videoType: uploaded.contentType as AiCoachingVideoType,
        videoUrl: uploaded.url,
      }))

      toast.success('Video uploaded successfully.')
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError))
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

  const saveContent = async (event: FormEvent) => {
    event.preventDefault()

    if (!contentId || !assertReadyToSave(draft)) {
      return
    }

    try {
      setSubmitting(true)
      await aiCoachingService.updateAiCoachingContent(contentId, buildPayload(draft))
      toast.success('Coaching content updated successfully.')
      navigate(`/ai-coaching/${contentId}`)
    } catch (saveError) {
      toast.error(getErrorMessage(saveError))
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <LoadingState label="Loading editable content..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/ai-coaching')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </span>
        </Button>
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">{error}</div>
      </div>
    )
  }

  return (
    <Card
      title="Edit Coaching Content"
      subtitle="Update the current video details and publishing state."
      action={
        <Button
          variant="ghost"
          className="inline-flex items-center justify-center whitespace-nowrap px-4"
          onClick={() => navigate(contentId ? `/ai-coaching/${contentId}` : '/ai-coaching')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Details
        </Button>
      }
    >
      <form className="grid gap-5" onSubmit={saveContent}>
        <Input
          label="Title"
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          required
        />

        <label className="grid gap-2 text-sm text-text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Description</span>
          <textarea
            className="min-h-28 rounded-2xl border border-border bg-panel px-4 py-3 text-white outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
            value={draft.description}
            maxLength={300}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
          <span className="justify-self-end text-xs text-text-dim">{draft.description.length}/300</span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Category</span>
            <select
              className="h-11 rounded-xl border border-border bg-panel px-3 text-white outline-none transition focus:border-neon"
              value={draft.category}
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
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
            value={draft.duration}
            onChange={(event) => setDraft((current) => ({ ...current, duration: event.target.value }))}
          />
        </div>

        <div className="rounded-2xl border border-border bg-panel p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Publish to App</p>
              <p className="text-sm text-text-muted">Make this video visible to users after saving.</p>
            </div>
            <Toggle checked={draft.publishToApp} onChange={(next) => setDraft((current) => ({ ...current, publishToApp: next }))} />
          </div>
        </div>

        <label className="grid gap-2 text-sm text-text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Replace Video</span>
          <div
            className="rounded-[24px] border border-dashed border-[#33435a] bg-panel p-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#223049] text-neon">
              {isUploading ? <Spinner className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
            </div>
            <p className="mt-5 text-xl font-semibold text-white">
              {isUploading ? 'Uploading Video...' : 'Click to upload or drag and drop'}
            </p>
            <p className="mt-2 text-sm text-text-muted">MP4, WEBM, MOV, max {maxVideoSizeMb}MB</p>
            <label className="mt-5 inline-flex h-10 cursor-pointer items-center rounded-xl border border-neon/20 bg-black/20 px-4 text-sm font-semibold text-neon">
              Select File
              <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleUploadSelection} />
            </label>
          </div>
        </label>

        {draft.videoName ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-[#1a2230] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon">
                <Video className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="break-words font-semibold text-white">{draft.videoName}</p>
                <p className="text-sm text-text-muted">
                  {formatBytes(draft.videoSizeBytes)}{draft.duration ? ` - ${draft.duration}` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-white"
              onClick={() => window.open(draft.videoUrl, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </button>
          </div>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button variant="ghost" type="button" onClick={() => navigate(contentId ? `/ai-coaching/${contentId}` : '/ai-coaching')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner className="text-black" /> : null}
              Save Changes
            </span>
          </Button>
        </div>
      </form>
    </Card>
  )
}
