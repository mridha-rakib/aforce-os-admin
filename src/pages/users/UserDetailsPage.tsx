import { ArrowLeft, Calendar, CheckCircle2, Fingerprint, Globe2, LockKeyhole, Mail, ShieldCheck, UserRound, Waves } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { useUsersStore } from '../../store/usersStore'
import type { UserDetails } from '../../types'

function formatDate(value?: string) {
  if (!value) return 'Not provided'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatShortDate(value?: string) {
  if (!value) return 'Not provided'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'User details could not be loaded.'
}

function DetailMetric({
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
      <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-white">{value || 'Not provided'}</span>
    </div>
  )
}

function ProviderBadge({ label, active }: { label: string; active: boolean }) {
  return <Badge label={`${label}: ${active ? 'Linked' : 'Not linked'}`} tone={active ? 'green' : 'gray'} />
}

export function UserDetailsPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const fetchUser = useUsersStore((state) => state.fetchUser)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [user, setUser] = useState<UserDetails | null>(null)

  useEffect(() => {
    if (!userId) {
      setError('User id is missing.')
      setLoading(false)
      return
    }

    let isMounted = true
    setError(null)
    setLoading(true)

    void fetchUser(userId)
      .then((nextUser) => {
        if (isMounted) {
          setUser(nextUser)
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
  }, [fetchUser, userId])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <LoadingState label="Loading user details..." />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </span>
        </Button>
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">{error ?? 'User was not found.'}</div>
      </div>
    )
  }

  const initials = getInitials(user.name) || 'U'
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/users')}>
        <span className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </span>
      </Button>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 xl:grid-cols-[360px_1fr]">
          <div className="flex flex-col items-center justify-center border-b border-border bg-[#0b1017] p-8 text-center xl:border-b-0 xl:border-r">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-28 w-28 rounded-full border border-neon/30 object-cover" />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-full border border-neon/30 bg-neon text-4xl font-bold text-black">
                {initials}
              </div>
            )}
            <h2 className="mt-5 text-3xl font-bold text-white">{user.name}</h2>
            <p className="mt-2 break-all text-sm text-text-muted">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge label={user.status} tone={user.status === 'Active' ? 'green' : 'red'} />
              <Badge label={user.subscription.toUpperCase()} tone={user.subscription === 'Free' ? 'blue' : 'green'} />
              <Badge label={user.role.toUpperCase()} tone="gray" />
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">User Record</p>
              <h3 className="mt-2 text-3xl font-bold text-white">Complete account details</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">Profile, access, verification, provider, and system metadata for this user.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailMetric icon={<Waves className="h-5 w-5" />} label="Hydration Score" value={`${user.hydrationScore}%`} />
              <DetailMetric icon={<ShieldCheck className="h-5 w-5" />} label="Status" value={user.status} />
              <DetailMetric icon={<Calendar className="h-5 w-5" />} label="Joined" value={user.joinDate} />
              <DetailMetric icon={<CheckCircle2 className="h-5 w-5" />} label="Email Verified" value={user.emailVerifiedAt ? 'Yes' : 'No'} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Profile Information</h3>
              <p className="text-sm text-text-muted">Names, contact, location, and personal profile fields.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/50 px-5">
            <InfoRow label="Internal ID" value={user.id} />
            <InfoRow label="Display Name" value={user.displayName || user.name} />
            <InfoRow label="Full Name" value={fullName || user.name} />
            <InfoRow label="First Name" value={user.firstName} />
            <InfoRow label="Last Name" value={user.lastName} />
            <InfoRow label="Email Address" value={user.email} />
            <InfoRow label="Country" value={user.country} />
            <InfoRow label="Date of Birth" value={formatShortDate(user.dateOfBirth)} />
            <InfoRow label="Avatar URL" value={user.avatar} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Access & Authentication</h3>
              <p className="text-sm text-text-muted">Subscription, account state, and login provider details.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/50 px-5">
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="Status" value={<Badge label={user.status} tone={user.status === 'Active' ? 'green' : 'red'} />} />
            <InfoRow label="Subscription" value={<Badge label={user.subscription.toUpperCase()} tone={user.subscription === 'Free' ? 'blue' : 'green'} />} />
            <InfoRow label="Hydration Score" value={`${user.hydrationScore}%`} />
            <InfoRow label="Password Login" value={user.hasPassword ? 'Enabled' : 'Not enabled'} />
            <InfoRow label="Email Verified At" value={formatDate(user.emailVerifiedAt)} />
            <InfoRow
              label="Providers"
              value={
                <span className="inline-flex flex-wrap justify-end gap-2">
                  <ProviderBadge label="Password" active={user.providers.password} />
                  <ProviderBadge label="Google" active={user.providers.google} />
                  <ProviderBadge label="Apple" active={user.providers.apple} />
                </span>
              }
            />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Provider Identifiers</h3>
              <p className="text-sm text-text-muted">External authentication references when linked.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/50 px-5">
            <InfoRow label="Google ID" value={user.googleId} />
            <InfoRow label="Apple Subject" value={user.appleSubject} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">System Metadata</h3>
              <p className="text-sm text-text-muted">Creation and latest update timestamps.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/50 px-5">
            <InfoRow label="Join Date" value={user.joinDate} />
            <InfoRow label="Created At" value={formatDate(user.createdAt)} />
            <InfoRow label="Updated At" value={formatDate(user.updatedAt)} />
            <InfoRow label="Primary Email" value={<span className="inline-flex items-center justify-end gap-2"><Mail className="h-4 w-4 text-neon" />{user.email}</span>} />
          </div>
        </section>
      </div>
    </div>
  )
}
