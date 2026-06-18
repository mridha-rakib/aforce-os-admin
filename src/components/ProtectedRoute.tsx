import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from './ui/LoadingState'
import { authService } from '../services/authService'
import { selectAccessToken, selectAuthHydrated, selectIsAuthenticated, useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const hasHydrated = useAuthStore(selectAuthHydrated)
  const accessToken = useAuthStore(selectAccessToken)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [isVerifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!hasHydrated || !accessToken || !isAuthenticated) {
      return
    }

    let isMounted = true
    setVerifying(true)

    authService
      .getCurrentUser()
      .then((user) => {
        if (!isMounted) {
          return
        }

        if (user.role !== 'admin') {
          logout()
          return
        }

        updateUser(user)
      })
      .catch(() => {
        if (isMounted) {
          logout()
        }
      })
      .finally(() => {
        if (isMounted) {
          setVerifying(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [accessToken, hasHydrated, isAuthenticated, logout, updateUser])

  if (!hasHydrated || isVerifying) {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <LoadingState label="Verifying session..." size="lg" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
