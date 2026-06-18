import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from './AuthShell'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    toast.success(`Password reset link sent to ${email || 'your admin email'} (mock).`)
  }

  return (
    <AuthShell title="Forgot Password" subtitle="Enter your admin email to receive a reset link.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="Admin Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@aforce.admin" />
        <Button type="submit" className="w-full">Send Reset Link</Button>
        <Link className="block text-center text-sm text-neon" to="/login">Back to Login</Link>
      </form>
    </AuthShell>
  )
}
