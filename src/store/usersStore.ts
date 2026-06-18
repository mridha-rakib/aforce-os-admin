import { create } from 'zustand'
import { userService, type ListUsersParams } from '../services/userService'
import type { SubscriptionType, User, UserDetails, UserStatus } from '../types'

interface CreateUserInput {
  name: string
  email: string
  subscription: SubscriptionType
  status: UserStatus
}

interface UpdateUserInput extends CreateUserInput {
  id: string
}

interface UsersState {
  error: string | null
  fetchUsers: (params?: ListUsersParams) => Promise<void>
  fetchUser: (id: string) => Promise<UserDetails>
  isLoading: boolean
  users: User[]
  createUser: (input: CreateUserInput) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  updateUser: (input: UpdateUserInput) => Promise<User>
  setUserStatus: (id: string, status: UserStatus) => Promise<void>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'User request failed.'
}

export const useUsersStore = create<UsersState>()((set) => ({
  error: null,
  isLoading: false,
  users: [],
  createUser: async (input) => {
    set({ error: null })

    try {
      const user = await userService.createUser({
        email: input.email.trim(),
        hydrationScore: 0,
        name: input.name.trim(),
        status: input.status,
        subscription: input.subscription,
      })

      set((state) => ({ users: [user, ...state.users] }))
      return user
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  deleteUser: async (id) => {
    set({ error: null })

    try {
      await userService.deleteUser(id)
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  fetchUsers: async (params) => {
    set({ error: null, isLoading: true })

    try {
      const users = await userService.listUsers(params)
      set({ users })
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  fetchUser: async (id) => {
    set({ error: null })

    try {
      return await userService.getUser(id)
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  setUserStatus: async (id, status) => {
    set({ error: null })

    try {
      const user = await userService.updateUser(id, { status })
      set((state) => ({
        users: state.users.map((item) => (item.id === user.id ? user : item)),
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
  updateUser: async (input) => {
    set({ error: null })

    try {
      const user = await userService.updateUser(input.id, {
        email: input.email.trim(),
        name: input.name.trim(),
        status: input.status,
        subscription: input.subscription,
      })

      set((state) => ({
        users: state.users.map((item) => (item.id === user.id ? user : item)),
      }))
      return user
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },
}))
