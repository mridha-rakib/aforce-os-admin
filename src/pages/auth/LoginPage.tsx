import { FormEvent, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from './AuthShell'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/spinner'
import { selectAuthHydrated, selectIsAuthenticated, useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import type { ApiFieldErrors, NormalizedApiError } from '../../services/api/types'

function getFieldError(fieldErrors: ApiFieldErrors | undefined, field: string): string | undefined {
  return fieldErrors?.[field]?.[0]
}

function hasFieldErrors(fieldErrors: ApiFieldErrors | undefined): boolean {
  return Object.values(fieldErrors ?? {}).some((messages) => Array.isArray(messages) && messages.length > 0)
}

export function LoginPage() {
  const hasHydrated = useAuthStore(selectAuthHydrated)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const [email, setEmail] = useState('admin@aforce.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>()
  const [isSubmitting, setSubmitting] = useState(false)
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  if (hasHydrated && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setFieldErrors(undefined)
    setSubmitting(true)

    try {
      const session = await authService.login({
        email,
        password,
      })

      if (session.user.role !== 'admin') {
        setError('This account does not have admin dashboard access.')
        return
      }

      setSession(session)
      toast.success('Login successful.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const apiError = error as NormalizedApiError
      setFieldErrors(apiError.fieldErrors)

      if (hasFieldErrors(apiError.fieldErrors)) {
        return
      }

      setError(apiError.message || 'Incorrect email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Admin Login" subtitle="Sign in to your administrator account">
      <form className="space-y-4" noValidate onSubmit={onSubmit}>
        {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
        <Input
          error={getFieldError(fieldErrors, 'email')}
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) => {
            setFieldErrors(undefined)
            setEmail(event.target.value)
          }}
          required
        />
        <label className="grid gap-2 text-sm text-text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">Password</span>
          <div className="relative">
            <input
              aria-invalid={Boolean(getFieldError(fieldErrors, 'password')) || undefined}
              className={`h-11 w-full rounded-xl border bg-panel px-4 pr-12 text-white outline-none transition focus:ring-2 ${
                getFieldError(fieldErrors, 'password')
                  ? 'border-red-400/70 focus:border-red-300 focus:ring-red-400/20'
                  : 'border-border focus:border-neon focus:ring-neon/20'
              }`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setFieldErrors(undefined)
                setPassword(event.target.value)
              }}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-neon transition hover:bg-neon/10 focus:outline-none focus:ring-2 focus:ring-neon/30"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
            </button>
          </div>
          {getFieldError(fieldErrors, 'password') ? (
            <span className="text-xs leading-5 text-red-300">{getFieldError(fieldErrors, 'password')}</span>
          ) : null}
        </label>
        <div className="flex items-center justify-between text-sm text-text-muted">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-lime-400" /> Remember me</label>
          <Link className="text-neon" to="/forgot-password">Forgot Password?</Link>
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          <span className="inline-flex items-center justify-center gap-2">
            {isSubmitting ? <Spinner /> : null}
            {isSubmitting ? 'Logging in...' : 'Login'}
          </span>
        </Button>
        <p className="pt-3 text-center text-xs text-text-dim">Protected by AForce Security Systems. © 2024</p>
      </form>
    </AuthShell>
  )
}
