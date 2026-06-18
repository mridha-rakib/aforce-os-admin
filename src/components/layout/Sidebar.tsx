import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, Bell, BookOpen, Bot, Box, ChevronDown, ChevronUp, Gauge, LayoutDashboard, LogOut, Settings, ShoppingCart, UserCog, Users } from 'lucide-react'
import { cn } from '../../utils/cn'
import { selectRefreshToken, selectUserImage, selectUserName, selectUserRole, useAuthStore } from '../../store/authStore'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { authService } from '../../services/authService'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Products', to: '/products', icon: Box },
  { label: 'Orders', to: '/orders', icon: ShoppingCart },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Content', to: '/content', icon: BookOpen },
  { label: 'AI Coaching', to: '/ai-coaching', icon: Bot },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Subscriptions', to: '/subscriptions', icon: Gauge },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar() {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const logout = useAuthStore((state) => state.logout)
  const refreshToken = useAuthStore(selectRefreshToken)
  const userName = useAuthStore(selectUserName)
  const userRole = useAuthStore(selectUserRole)
  const userImage = useAuthStore(selectUserImage)
  const navigate = useNavigate()
  const initials = useMemo(
    () =>
      userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase() ?? '')
        .join(''),
    [userName],
  )

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-border bg-sidebar p-4 lg:sticky lg:top-0 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-neon text-black">
          <UserCog className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-white">AForce</p>
          <p className="text-xs text-text-dim">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-muted transition hover:bg-panel hover:text-white', isActive && 'bg-neon/20 text-neon')
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="relative mt-auto" ref={profileRef}>
        {isMenuOpen ? (
          <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 overflow-hidden rounded-[18px] border border-border bg-[#101722] shadow-2xl shadow-black/50">
            <button
              className="flex h-9 w-full items-center gap-2 px-3 text-[11px] font-semibold text-white transition hover:bg-white/5"
              onClick={() => {
                setMenuOpen(false)
                navigate('/profile')
              }}
            >
              <Users className="h-3 w-3" />
              View Profile
            </button>
            <button
              className="flex h-8 w-full items-center gap-2 px-3 text-[11px] font-semibold text-red-300 transition hover:bg-red-500/10"
              onClick={() => {
                setMenuOpen(false)
                setShowLogoutConfirm(true)
              }}
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </div>
        ) : null}

        <button
          className="flex w-full items-center gap-2 rounded-[20px] border border-border bg-[#0c1017] px-3 py-2 transition hover:border-slate-500"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {userImage ? (
            <img src={userImage} alt={userName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#f0bf97] text-xs font-bold text-white">
              {initials || 'AR'}
            </div>
          )}
          <div className="flex-1 text-left">
            <p className="text-[14px] font-semibold leading-tight text-white">{userName}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-[#7d8da7]">{userRole}</p>
          </div>
          <div className="flex flex-col text-[#7d8da7]">
            <ChevronUp className="h-2.5 w-2.5" />
            <ChevronDown className="h-2.5 w-2.5" />
          </div>
        </button>
      </div>

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Logout?" className="max-w-md">
        <p className="text-sm text-text-muted">Are you sure you want to log out from the admin dashboard?</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (refreshToken) {
                await authService.logout(refreshToken).catch(() => undefined)
              }

              logout()
              setShowLogoutConfirm(false)
              navigate('/login', { replace: true })
            }}
          >
            Confirm Logout
          </Button>
        </div>
      </Modal>
    </aside>
  )
}
