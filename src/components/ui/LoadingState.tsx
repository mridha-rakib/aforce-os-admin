import { Spinner } from './spinner'
import { cn } from '../../utils/cn'

type LoadingStateProps = {
  className?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
}

export function LoadingState({ className, label = 'Loading...', size = 'md' }: LoadingStateProps) {
  return (
    <div className={cn('inline-flex items-center justify-center gap-3 text-sm font-medium text-text-muted', className)}>
      <Spinner className={sizeClasses[size]} />
      <span>{label}</span>
    </div>
  )
}
