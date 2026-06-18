import { ArrowLeft, Calendar, Clock, ExternalLink, Eye, FilePenLine, FileVideo, PlayCircle, Tag, Timer, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import {
  aiCoachingService,
  type AiCoachingContent,
  type AiCoachingStatus,
  type AiCoachingType,
} from '../../services/aiCoachingService'

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

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || 'Not available'

  return date.toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatWatchHours(totalSeconds: number) {
  return `${(totalSeconds / 3600).toFixed(1)}h`
}

function getFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()
  return extension && extension !== fileName ? extension.toUpperCase() : 'FILE'
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'AI coaching content could not be loaded.'
}

function DetailPanel({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-white">{value || 'Not provided'}</p>
    </div>
  )
}

function AnalyticsCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode
  label: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-dim">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-neon/10 text-neon">{icon}</div>
      </div>
      <p className="mt-4 text-xs text-text-muted">{note}</p>
    </div>
  )
}

export function AICoachingDetailsPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState<AiCoachingContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)

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
      .then((nextContent) => {
        if (isMounted) {
          setContent(nextContent)
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

  const analytics = content?.analytics ?? { totalWatchSeconds: 0, uniqueViewers: 0, viewCount: 0 }
  const averageWatchSeconds = analytics.viewCount > 0 ? analytics.totalWatchSeconds / analytics.viewCount : 0
  const fileExtension = getFileExtension(content?.videoName ?? '')

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <LoadingState label="Loading AI coaching content..." />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/ai-coaching')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </span>
        </Button>
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">{error ?? 'Content was not found.'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/ai-coaching')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </span>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="inline-flex items-center justify-center"
            onClick={() => navigate(`/ai-coaching/${content.id}/edit`)}
          >
            <FilePenLine className="mr-2 h-4 w-4" />
            Edit Content
          </Button>

          {content.videoUrl ? (
            <Button
              type="button"
              variant="ghost"
              className="inline-flex items-center justify-center"
              onClick={() => window.open(content.videoUrl, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Source File
            </Button>
          ) : null}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="bg-black">
            {content.videoUrl ? (
              <video className="aspect-video h-full w-full bg-black object-contain" src={content.videoUrl} controls preload="metadata" />
            ) : (
              <div className="grid aspect-video place-items-center bg-panel text-text-muted">
                <FileVideo className="h-12 w-12" />
              </div>
            )}
          </div>

          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={content.type.toUpperCase()} tone={typeToneMap[content.type]} />
              <Badge label={content.status} tone={statusToneMap[content.status]} />
              <Badge label={content.publishToApp ? 'Visible in app' : 'Hidden from app'} tone={content.publishToApp ? 'green' : 'gray'} />
            </div>

            <div>
              <h2 className="text-4xl font-bold leading-tight text-white">{content.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">
                {content.description || 'No description has been added for this content.'}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailPanel icon={<Tag className="h-5 w-5" />} label="Category" value={content.category} />
              <DetailPanel icon={<Timer className="h-5 w-5" />} label="Duration" value={content.duration} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <AnalyticsCard icon={<Eye className="h-5 w-5" />} label="User Views" value={analytics.viewCount.toLocaleString()} note="Total opens from the user app." />
        <AnalyticsCard icon={<Clock className="h-5 w-5" />} label="Watch Time" value={formatWatchHours(analytics.totalWatchSeconds)} note="Total watched hours from users." />
        <AnalyticsCard icon={<Users className="h-5 w-5" />} label="Unique Viewers" value={analytics.uniqueViewers.toLocaleString()} note="Distinct users who viewed it." />
        <AnalyticsCard icon={<PlayCircle className="h-5 w-5" />} label="Avg. Watch" value={`${Math.round(averageWatchSeconds)}s`} note="Average watch time per view." />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">File Details</h3>
            <p className="text-sm text-text-muted">Original uploaded asset and delivery metadata.</p>
          </div>

          <div className="rounded-2xl border border-border bg-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">Original file</p>
                <p className="mt-2 break-words text-lg font-bold text-white">{content.videoName}</p>
              </div>
              <span className="rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-bold text-neon">{fileExtension}</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <DetailPanel icon={<FileVideo className="h-5 w-5" />} label="File Size" value={formatBytes(content.videoSizeBytes)} />
              <DetailPanel icon={<FileVideo className="h-5 w-5" />} label="Content Type" value={content.videoType} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">Publishing Timeline</h3>
            <p className="text-sm text-text-muted">Content lifecycle and admin updates.</p>
          </div>

          <div className="rounded-2xl border border-border bg-panel px-5">
            <div className="flex items-center justify-between gap-4 border-b border-border py-4">
              <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                <Calendar className="h-4 w-4 text-neon" />
                Created
              </span>
              <span className="text-right text-sm font-semibold text-white">{formatDate(content.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                <Clock className="h-4 w-4 text-neon" />
                Updated
              </span>
              <span className="text-right text-sm font-semibold text-white">{formatDate(content.updatedAt)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
