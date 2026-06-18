import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Camera, Mail, ShieldCheck, User } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { selectUserEmail, selectUserImage, selectUserName, selectUserRole, useAuthStore } from '../../store/authStore'

export function ProfilePage() {
  const userName = useAuthStore(selectUserName)
  const userEmail = useAuthStore(selectUserEmail)
  const userPassword = useAuthStore((state) => state.userPassword)
  const userRole = useAuthStore(selectUserRole)
  const userImage = useAuthStore(selectUserImage)
  const updateProfile = useAuthStore((state) => state.updateProfile)

  const [form, setForm] = useState({
    userName,
    userEmail,
    userPassword,
    userImage,
  })
  const [status, setStatus] = useState('')

  const initials = useMemo(
    () =>
      form.userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase() ?? '')
        .join(''),
    [form.userName],
  )

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, userImage: typeof reader.result === 'string' ? reader.result : current.userImage }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    updateProfile(form)
    setStatus('Profile updated successfully.')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
      <Card title="Profile Overview" subtitle="This preview updates with your saved profile details.">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-panel px-6 py-8 text-center">
          {form.userImage ? (
            <img src={form.userImage} alt={form.userName} className="h-28 w-28 rounded-full object-cover" />
          ) : (
            <div className="grid h-28 w-28 place-items-center rounded-full bg-[#f0bf97] text-3xl font-bold text-white">{initials || 'AR'}</div>
          )}
          <h2 className="mt-5 text-2xl font-semibold text-white">{form.userName}</h2>
          <p className="mt-1 text-sm text-text-muted">{form.userEmail}</p>
          <p className="mt-3 rounded-full border border-neon/20 bg-neon/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neon">{userRole}</p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-border bg-panel p-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-neon" />
              <div>
                <p className="font-semibold text-white">Editable account</p>
                <p className="text-sm text-text-muted">Change name, email, password and image from the form.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-panel p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-neon" />
              <div>
                <p className="font-semibold text-white">Login sync</p>
                <p className="text-sm text-text-muted">Updated email and password become the new admin login credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Edit Profile" subtitle="Save changes to update the user menu, topbar and login credentials.">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {status ? <p className="rounded-xl border border-neon/20 bg-neon/10 px-4 py-3 text-sm text-neon">{status}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={form.userName}
              onChange={(event) => {
                setStatus('')
                setForm((current) => ({ ...current, userName: event.target.value }))
              }}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={form.userEmail}
              onChange={(event) => {
                setStatus('')
                setForm((current) => ({ ...current, userEmail: event.target.value }))
              }}
              required
            />
          </div>

          <Input
            label="Password"
            type="password"
            value={form.userPassword}
            onChange={(event) => {
              setStatus('')
              setForm((current) => ({ ...current, userPassword: event.target.value }))
            }}
            required
          />

          <label className="grid gap-2 text-sm text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Profile Image</span>
            <div className="rounded-2xl border border-dashed border-border bg-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">Upload a new avatar</p>
                  <p className="text-sm text-text-muted">PNG or JPG works well for the profile menu and topbar.</p>
                </div>
                <label className="inline-flex h-11 cursor-pointer items-center rounded-xl bg-neon px-4 text-sm font-semibold text-black shadow-neon">
                  <Camera className="mr-2 h-4 w-4" />
                  Choose Image
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>
          </label>

          <div className="rounded-2xl border border-border bg-panel p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-neon" />
              <p className="text-sm text-text-muted">Current role stays <span className="font-semibold text-white">{userRole}</span>. Only profile details are editable here.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStatus('')
                setForm({ userName, userEmail, userPassword, userImage })
              }}
            >
              Reset
            </Button>
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
