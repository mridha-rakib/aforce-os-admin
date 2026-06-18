import { AlertCircle, Ban, ChevronDown, Eye, PencilLine, RotateCcw, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LoadingState } from '../../components/ui/LoadingState'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/spinner'
import { Table } from '../../components/ui/Table'
import { Toggle } from '../../components/ui/Toggle'
import { useUsersStore } from '../../store/usersStore'
import type { SubscriptionType, User, UserStatus } from '../../types'

type UserDraft = {
  name: string
  email: string
  subscription: SubscriptionType
  status: UserStatus
}

const defaultDraft: UserDraft = {
  name: '',
  email: '',
  subscription: 'Pro',
  status: 'Active',
}

function UserFormModal({
  isOpen,
  title,
  submitLabel,
  draft,
  isSubmitting = false,
  onClose,
  onDraftChange,
  onSubmit,
}: {
  isOpen: boolean
  title: string
  submitLabel: string
  draft: UserDraft
  isSubmitting?: boolean
  onClose: () => void
  onDraftChange: (next: UserDraft) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const isDisabled = isSubmitting || !draft.name.trim() || !draft.email.trim()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-[392px] rounded-[22px] border-[#30311d] bg-[#1d1d1c] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
    >
      <form className="-mx-6 -mb-5 mt-[-4px]" onSubmit={onSubmit}>
        <div className="space-y-4 px-5 pb-4 pt-2">
          <Input
            label="Full Name"
            value={draft.name}
            placeholder="Alex Rivera"
            onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
            className="h-11 rounded-[14px] border-[#363636] bg-[#2c2c2b] text-[15px] text-[#d7d7d7] placeholder:text-[#8c8c8b] focus:border-neon focus:ring-neon/15"
          />
          <Input
            label="Email Address"
            type="email"
            value={draft.email}
            placeholder="alex.rivera@example.com"
            onChange={(event) => onDraftChange({ ...draft, email: event.target.value })}
            className="h-11 rounded-[14px] border-[#363636] bg-[#2c2c2b] text-[15px] text-[#d7d7d7] placeholder:text-[#8c8c8b] focus:border-neon focus:ring-neon/15"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-[#90959c]">
              <span className="text-xs font-semibold text-[#7f8792]">Subscription Type</span>
              <div className="relative">
                <select
                  value={draft.subscription}
                  onChange={(event) => onDraftChange({ ...draft, subscription: event.target.value as SubscriptionType })}
                  className="h-11 w-full appearance-none rounded-[14px] border border-[#363636] bg-[#2c2c2b] px-4 pr-10 text-[15px] text-[#d7d7d7] outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/15"
                >
                  <option>Free</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b5ff00]" />
              </div>
            </label>

            <div className="grid gap-2 text-sm text-[#90959c]">
              <span className="text-xs font-semibold text-[#7f8792]">User Status</span>
              <div className="flex h-11 items-center justify-between rounded-[14px] border border-[#363636] bg-[#2c2c2b] px-4">
                <span className="text-[15px] text-[#d7d7d7]">{draft.status}</span>
                <Toggle
                  checked={draft.status === 'Active'}
                  onChange={(next) => onDraftChange({ ...draft, status: next ? 'Active' : 'Blocked' })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[14px] border border-[#425700] bg-[#232d13] px-3 py-3 text-[12px] leading-5 text-[#7f8792]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b5ff00]" />
            <p>Changing the subscription type will immediately affect the user&apos;s access to premium features. The user will be notified via email.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-b-[22px] border-t border-[#313131] bg-[#2a2a29] px-5 py-4">
          <button type="button" onClick={onClose} className="px-4 text-sm font-semibold text-[#b8b8b8] transition hover:text-white">
            Cancel
          </button>
          <Button
            type="submit"
            disabled={isDisabled}
            className="h-11 min-w-32 rounded-[14px] bg-[#c6ff00] px-5 text-sm font-semibold text-black shadow-[0_0_22px_rgba(198,255,0,0.3)] hover:brightness-105"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner className="text-black" /> : null}
              {submitLabel}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function UsersPage() {
  const users = useUsersStore((state) => state.users)
  const error = useUsersStore((state) => state.error)
  const fetchUsers = useUsersStore((state) => state.fetchUsers)
  const isLoading = useUsersStore((state) => state.isLoading)
  const createUser = useUsersStore((state) => state.createUser)
  const deleteUser = useUsersStore((state) => state.deleteUser)
  const updateUser = useUsersStore((state) => state.updateUser)
  const setUserStatus = useUsersStore((state) => state.setUserStatus)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All')
  const [subscriptionFilter, setSubscriptionFilter] = useState<'All' | SubscriptionType>('All')
  const [selected, setSelected] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showBlock, setShowBlock] = useState(false)
  const [createDraft, setCreateDraft] = useState<UserDraft>(defaultDraft)
  const [editDraft, setEditDraft] = useState<UserDraft>(defaultDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const filtered = useMemo(
    () => users.filter((user) => {
      const matchesSearch = [user.name, user.email, user.id].join(' ').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter
      const matchesSubscription = subscriptionFilter === 'All' || user.subscription === subscriptionFilter

      return matchesSearch && matchesStatus && matchesSubscription
    }),
    [search, statusFilter, subscriptionFilter, users],
  )
  const isAddModalOpen = searchParams.get('modal') === 'add'
  const editing = useMemo(() => users.find((user) => user.id === editingId) ?? null, [editingId, users])
  const selectedNextStatus: UserStatus = selected?.status === 'Blocked' ? 'Active' : 'Blocked'

  useEffect(() => {
    void fetchUsers().catch(() => undefined)
  }, [fetchUsers])

  useEffect(() => {
    if (editing) {
      setEditDraft({
        name: editing.name,
        email: editing.email,
        subscription: editing.subscription,
        status: editing.status,
      })
      return
    }

    setEditDraft(defaultDraft)
  }, [editing])

  const closeAddModal = () => {
    setCreateDraft(defaultDraft)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('modal')
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input placeholder="Search by name, email, or ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'All' | UserStatus)}
          className="h-11 rounded-xl border border-border bg-panel px-4 text-sm font-semibold text-text-muted outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
        >
          <option value="All">Status: All</option>
          <option value="Active">Status: Active</option>
          <option value="Blocked">Status: Blocked</option>
        </select>
        <select
          value={subscriptionFilter}
          onChange={(event) => setSubscriptionFilter(event.target.value as 'All' | SubscriptionType)}
          className="h-11 rounded-xl border border-border bg-panel px-4 text-sm font-semibold text-text-muted outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
        >
          <option value="All">Subscription: All</option>
          <option value="Free">Subscription: Free</option>
          <option value="Pro">Subscription: Pro</option>
          <option value="Enterprise">Subscription: Enterprise</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </div>
      ) : null}

      <Table columns={['User', 'Hydration Score', 'Subscription', 'Status', 'Join Date', 'Actions']}>
        {isLoading && users.length === 0 ? (
          <tr className="border-t border-border">
            <td colSpan={6} className="px-4 py-10 text-center">
              <LoadingState label="Loading users..." />
            </td>
          </tr>
        ) : filtered.length === 0 ? (
          <tr className="border-t border-border">
            <td colSpan={6} className="px-4 py-10 text-center text-text-muted">No users found.</td>
          </tr>
        ) : (
          filtered.map((user) => (
            <tr key={user.id} className="border-t border-border">
              <td className="px-4 py-3">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </td>
              <td className="px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-neon" style={{ width: `${user.hydrationScore}%` }} />
                  </div>
                  {user.hydrationScore}%
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge label={user.subscription.toUpperCase()} tone={user.subscription === 'Pro' || user.subscription === 'Enterprise' ? 'green' : 'blue'} />
              </td>
              <td className="px-4 py-3">
                <Badge label={user.status} tone={user.status === 'Active' ? 'green' : 'red'} />
              </td>
              <td className="px-4 py-3 text-text-muted">{user.joinDate}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-panel text-text-muted transition hover:border-neon/50 hover:text-neon"
                    title="View user details"
                    aria-label={`View details for ${user.name}`}
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <Eye size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-panel text-text-muted transition hover:border-neon/50 hover:text-neon"
                    title="Edit user"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => setEditingId(user.id)}
                  >
                    <PencilLine size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className={
                      user.status === 'Blocked'
                        ? 'inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-black transition hover:brightness-110'
                        : 'inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400'
                    }
                    title={user.status === 'Blocked' ? 'Unblock user' : 'Block user'}
                    aria-label={`${user.status === 'Blocked' ? 'Unblock' : 'Block'} ${user.name}`}
                    onClick={() => {
                      setSelected(user)
                      setShowBlock(true)
                    }}
                  >
                    {user.status === 'Blocked'
                      ? <RotateCcw size={18} strokeWidth={2.5} />
                      : <Ban size={18} strokeWidth={2.5} />}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400"
                    title="Delete user"
                    aria-label={`Delete ${user.name}`}
                    onClick={() => setDeleteTarget(user)}
                  >
                    <Trash size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <p className="text-sm text-text-dim">Showing {filtered.length === 0 ? 0 : 1}-{filtered.length} of {users.length} users</p>

      <UserFormModal
        isOpen={isAddModalOpen}
        title="Add User"
        submitLabel={isSubmitting ? 'Adding...' : 'Add User'}
        draft={createDraft}
        isSubmitting={isSubmitting}
        onClose={closeAddModal}
        onDraftChange={setCreateDraft}
        onSubmit={(event) => {
          event.preventDefault()
          setIsSubmitting(true)
          void createUser(createDraft)
            .then(() => {
              toast.success('User added successfully.')
              closeAddModal()
            })
            .catch(() => undefined)
            .finally(() => setIsSubmitting(false))
        }}
      />

      <UserFormModal
        isOpen={Boolean(editing)}
        title="Edit User"
        submitLabel={isSubmitting ? 'Saving...' : 'Save Changes'}
        draft={editDraft}
        isSubmitting={isSubmitting}
        onClose={() => setEditingId(null)}
        onDraftChange={setEditDraft}
        onSubmit={(event) => {
          event.preventDefault()
          if (!editing) return
          setIsSubmitting(true)
          void updateUser({ id: editing.id, ...editDraft })
            .then(() => {
              toast.success('User updated successfully.')
              setEditingId(null)
            })
            .catch(() => undefined)
            .finally(() => setIsSubmitting(false))
        }}
      />

      <Modal isOpen={showBlock} onClose={() => setShowBlock(false)} title={selectedNextStatus === 'Blocked' ? 'Block this user?' : 'Unblock this user?'} className="max-w-md">
        <p className="text-text-muted">
          {selectedNextStatus === 'Blocked'
            ? 'This will prevent the user from accessing the app. This action can be reversed later.'
            : 'This will restore app access for the selected user.'}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowBlock(false)}>Cancel</Button>
          <Button
            variant={selectedNextStatus === 'Blocked' ? 'danger' : 'primary'}
            disabled={isSubmitting}
            onClick={() => {
              if (selected) {
                setIsSubmitting(true)
                void setUserStatus(selected.id, selectedNextStatus)
                  .then(() => {
                    toast.success(selectedNextStatus === 'Blocked' ? 'User blocked successfully.' : 'User unblocked successfully.')
                    setShowBlock(false)
                    setSelected(null)
                  })
                  .catch(() => undefined)
                  .finally(() => setIsSubmitting(false))
                return
              }
              setShowBlock(false)
            }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner className={selectedNextStatus === 'Blocked' ? 'text-white' : 'text-black'} /> : null}
              {selectedNextStatus === 'Blocked' ? 'Block User' : 'Unblock User'}
            </span>
          </Button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete this user?" className="max-w-md">
        <p className="text-text-muted">
          This will permanently remove {deleteTarget?.name ?? 'this user'} from the admin user list.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            disabled={isSubmitting}
            onClick={() => {
              if (!deleteTarget) return
              setIsSubmitting(true)
              void deleteUser(deleteTarget.id)
                .then(() => {
                  toast.success('User deleted successfully.')
                  setDeleteTarget(null)
                })
                .catch(() => undefined)
                .finally(() => setIsSubmitting(false))
            }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner className="text-white" /> : null}
              Delete User
            </span>
          </Button>
        </div>
      </Modal>
    </div>
  )
}
