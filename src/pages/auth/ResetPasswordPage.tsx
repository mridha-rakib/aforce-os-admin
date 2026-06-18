import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from './AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    toast.success('Password reset successfully (mock).')
  }

  return (
    <AuthShell title="Reset Your Password" subtitle="Please enter a new password for your account.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="New Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Input label="Confirm Password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <ul className="rounded-xl border border-border bg-panel p-3 text-sm text-text-muted">
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One number</li>
        </ul>
        <Button type="submit" className="w-full">Reset Password</Button>
        <Link className="block text-center text-sm text-neon" to="/login">Back to Login</Link>
      </form>
    </AuthShell>
  )
}
