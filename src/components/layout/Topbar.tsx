import { ReactNode, useState } from 'react'
import { Bell, CircleHelp, Search, SlidersHorizontal } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { selectUserName, selectUserRole, useAuthStore } from '../../store/authStore'

interface TopbarProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const { pathname } = useLocation()
  const [dashboardRange, setDashboardRange] = useState<'Last 30 days' | '90 days' | 'Year'>('Last 30 days')
  const userName = useAuthStore(selectUserName)
  const userRole = useAuthStore(selectUserRole)
  const isDashboard = pathname === '/dashboard'

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-black/85 px-6 py-4 backdrop-blur">
      <div className={`flex items-center justify-between gap-4 ${isDashboard ? '' : 'mb-4'}`}>
        <div>
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          {subtitle ? <p className="text-sm text-text-muted">{subtitle}</p> : null}
        </div>
        {isDashboard ? (
          <div className="flex items-center gap-3">
            <div className="flex rounded-[18px] border border-border bg-[#131821] p-1">
              {(['Last 30 days', '90 days', 'Year'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${
                    dashboardRange === range ? 'bg-neon text-black shadow-neon' : 'text-text-muted hover:text-white'
                  }`}
                  onClick={() => setDashboardRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-[#131821] text-text-muted transition hover:text-white"
              aria-label="Filter dashboard"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        ) : (
          action
        )}
      </div>
      {!isDashboard ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-10 w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-panel px-3 text-text-muted">
            <Search className="h-4 w-4" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search analytics, users, orders..." />
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-border bg-panel p-2 text-text-muted hover:text-white"><Bell className="h-4 w-4" /></button>
            <button className="rounded-full border border-border bg-panel p-2 text-text-muted hover:text-white"><CircleHelp className="h-4 w-4" /></button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-neon">{userRole.toUpperCase()}</p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
