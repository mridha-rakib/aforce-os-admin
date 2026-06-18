import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Topbar } from '../components/layout/Topbar'
import { Button } from '../components/ui/Button'
import { cn } from '../utils/cn'

const titles: Record<string, { title: string; subtitle: string; actionLabel?: string }> = {
  '/dashboard': { title: 'Dashboard Overview', subtitle: 'Platform performance summary' },
  '/users': { title: 'User Management', subtitle: 'Manage and monitor user accounts', actionLabel: '+ Add User' },
  '/products': { title: 'Product Management', subtitle: 'Admin workspace' },
  '/orders': { title: 'Order Management', subtitle: 'Track fulfillment and refunds', actionLabel: 'Export Orders' },
  '/analytics': { title: 'Analytics Dashboard', subtitle: 'Monitor hydration engagement and sales', actionLabel: 'Last 7 Days' },
  '/content': { title: 'Content Management', subtitle: 'Manage videos, articles and tips', actionLabel: '+ Add Content' },
  '/ai-coaching': { title: 'AI Coaching Content', subtitle: 'Manage educational content and publishing workflow' },
  '/notifications': { title: 'Notification Center', subtitle: 'Track alerts, announcements and delivery health', actionLabel: 'Send Broadcast' },
  '/subscriptions': { title: 'Subscription Management', subtitle: 'Monitor plans, renewals and MRR performance', actionLabel: 'Export Billing' },
  '/settings': { title: 'Settings & CMS', subtitle: 'Manage legal pages and dashboard configuration', actionLabel: 'Publish Changes' },
  '/profile': { title: 'Profile Settings', subtitle: 'Update your administrator account details and image', actionLabel: 'Account Security' },
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const meta = pathname.startsWith('/products/')
    ? { title: 'Product Details', subtitle: 'Marketplace product record' }
    : pathname.startsWith('/users/')
      ? { title: 'User Details', subtitle: 'Complete user account record' }
    : pathname.match(/^\/ai-coaching\/[^/]+\/edit$/)
      ? { title: 'Edit AI Coaching', subtitle: 'Update content details and publishing state' }
    : pathname.startsWith('/ai-coaching/')
      ? { title: 'AI Coaching Details', subtitle: 'Content performance and publishing record' }
    : titles[pathname] ?? { title: 'AForce Admin', subtitle: '' }
  const dashboardScrollMode = pathname === '/dashboard'

  const action = meta.actionLabel
    ? (
        <Button
          className="px-5"
          onClick={() => {
            if (pathname === '/users') {
              navigate('/users?modal=add')
              return
            }
          }}
        >
          {meta.actionLabel}
        </Button>
      )
    : undefined

  return (
    <div className="min-h-screen bg-black text-white lg:flex">
      <Sidebar />
      <div className={cn('flex min-h-screen flex-1 flex-col', dashboardScrollMode && 'h-screen overflow-hidden')}>
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          action={action}
        />
        <main className={cn('flex-1 p-6', dashboardScrollMode && 'overflow-y-auto')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
