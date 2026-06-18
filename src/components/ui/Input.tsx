import { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export function Input({ className, error, label, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-text-muted">
      {label ? <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">{label}</span> : null}
      <input
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          'h-11 rounded-xl border border-border bg-panel px-4 text-white outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20',
          error && 'border-red-400/70 focus:border-red-300 focus:ring-red-400/20',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs leading-5 text-red-300">{error}</span> : null}
    </label>
  )
}
