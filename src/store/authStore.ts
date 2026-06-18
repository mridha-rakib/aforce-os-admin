import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthSession, AuthUser } from '../services/authService'

interface ProfileOverrides {
  userImage: string
  userName: string
}

interface AuthState {
  accessToken: string | null
  hasHydrated: boolean
  refreshToken: string | null
  user: AuthUser | null
  userImage: string
  userName: string
  userPassword: string
  clearProfileOverrides: () => void
  logout: () => void
  setHasHydrated: (hasHydrated: boolean) => void
  setSession: (session: AuthSession) => void
  setTokens: (tokens: Pick<AuthSession, 'accessToken' | 'refreshToken'>) => void
  updateProfile: (profile: ProfileOverrides) => void
  updateUser: (user: AuthUser | null) => void
}

function getDisplayName(user: AuthUser | null, fallbackName: string): string {
  if (!user) {
    return fallbackName || 'Admin'
  }

  return user.displayName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      hasHydrated: false,
      refreshToken: null,
      user: null,
      userImage: '',
      userName: 'Admin',
      userPassword: '',
      clearProfileOverrides: () => set({ userImage: '', userName: 'Admin', userPassword: '' }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          userImage: '',
          userName: 'Admin',
          userPassword: '',
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSession: (session) =>
        set((state) => ({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
          userImage: state.userImage || session.user.avatarUrl || '',
          userName: getDisplayName(session.user, state.userName),
          userPassword: '',
        })),
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      updateProfile: ({ userImage, userName }) => set({ userImage, userName, userPassword: '' }),
      updateUser: (user) =>
        set((state) => ({
          user,
          userImage: state.userImage || user?.avatarUrl || '',
          userName: getDisplayName(user, state.userName),
        })),
    }),
    {
      name: 'aforce-dashboard-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        userImage: state.userImage,
        userName: state.userName,
      }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

export const selectAccessToken = (state: AuthState) => state.accessToken
export const selectRefreshToken = (state: AuthState) => state.refreshToken
export const selectAuthUser = (state: AuthState) => state.user
export const selectAuthHydrated = (state: AuthState) => state.hasHydrated
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin'
export const selectIsAuthenticated = (state: AuthState) => Boolean(state.accessToken && state.user?.role === 'admin')
export const selectUserEmail = (state: AuthState) => state.user?.email ?? ''
export const selectUserImage = (state: AuthState) => state.userImage || state.user?.avatarUrl || ''
export const selectUserName = (state: AuthState) => getDisplayName(state.user, state.userName)
export const selectUserRole = (state: AuthState) => (state.user?.role === 'admin' ? 'System Admin' : state.user?.role ?? 'Admin')
