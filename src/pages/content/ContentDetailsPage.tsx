import { ArrowLeft, Calendar, Clock, ExternalLink, FileText, Lightbulb, PlayCircle, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { contentService } from '../../services/contentService'
import type { ContentItem } from '../../types'

const typeToneMap: Record<ContentItem['type'], 'green' | 'yellow' | 'blue'> = {
  Article: 'yellow',
  Tip: 'blue',
  Video: 'green',
}

const statusToneMap: Record<ContentItem['status'], 'green' | 'red' | 'gray'> = {
  Archived: 'gray',
  Draft: 'red',
  Published: 'green',
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Content could not be loaded.'
}

function renderPreview(content: ContentItem) {
  if (content.mediaType?.startsWith('video/') && content.mediaUrl) {
    return <video className="aspect-video h-full w-full bg-black object-contain" src={content.mediaUrl} controls preload="metadata" />
  }

  if (content.mediaType?.startsWith('image/') && content.mediaUrl) {
    return <img className="aspect-video h-full w-full bg-panel object-contain" src={content.mediaUrl} alt={content.title} />
  }

  const Icon = content.type === 'Video' ? PlayCircle : content.type === 'Tip' ? Lightbulb : FileText
  return (
    <div className="grid aspect-video place-items-center bg-panel text-text-muted">
      <Icon className="h-12 w-12" />
    </div>
  )
}

export function ContentDetailsPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState<ContentItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (!contentId) {
      setError('Content id is missing.')
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setError(null)

    void contentService.getContent(contentId)
      .then((next) => {
        if (mounted) {
          setContent(next)
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(getErrorMessage(loadError))
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [contentId])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <LoadingState label="Loading content details..." />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/content')}>
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
        <Button variant="ghost" onClick={() => navigate('/content')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </span>
        </Button>
        <div className="flex items-center gap-2">
          {content.mediaUrl ? (
            <Button type="button" variant="ghost" onClick={() => window.open(content.mediaUrl, '_blank', 'noopener,noreferrer')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Source File
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={() => navigate('/content')}>
            Manage Content
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="bg-black">{renderPreview(content)}</div>
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={content.type.toUpperCase()} tone={typeToneMap[content.type]} />
              <Badge label={content.status} tone={statusToneMap[content.status]} />
            </div>

            <div>
              <h2 className="text-4xl font-bold leading-tight text-white">{content.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">
                {content.subtitle || 'No description has been added for this content.'}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-panel p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">
                  <Tag className="h-4 w-4 text-neon" />
                  Category
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{content.category || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-panel p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">
                  <FileText className="h-4 w-4 text-neon" />
                  Media Type
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{content.mediaType || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-xl font-semibold text-white">Publishing Timeline</h3>
        <p className="text-sm text-text-muted">Content lifecycle and admin updates.</p>

        <div className="mt-4 rounded-2xl border border-border bg-panel px-5">
          <div className="flex items-center justify-between gap-4 border-b border-border py-4">
            <span className="inline-flex items-center gap-2 text-sm text-text-muted">
              <Calendar className="h-4 w-4 text-neon" />
              Created
            </span>
            <span className="text-right text-sm font-semibold text-white">{content.createdAt}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="inline-flex items-center gap-2 text-sm text-text-muted">
              <Clock className="h-4 w-4 text-neon" />
              Updated
            </span>
            <span className="text-right text-sm font-semibold text-white">{content.updatedAt || 'Not available'}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
