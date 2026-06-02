import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthResponse } from '../types'
import { authService } from '../services/authService'

interface AuthStore {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (phone: string, password: string) => Promise<void>
  register: (phone: string, password: string, name: string) => Promise<void>
  logout: () => void
  getMe: () => Promise<void>
  setAuth: (auth: AuthResponse) => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authService.login({ phone, password })
          if (response.code === 0 && response.data) {
            const { user, token, refreshToken } = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            throw new Error(response.message)
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (phone: string, password: string, name: string) => {
        set({ isLoading: true })
        try {
          const response = await authService.register({ phone, password, name })
          if (response.code === 0 && response.data) {
            const { user, token, refreshToken } = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            throw new Error(response.message)
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        })
      },

      getMe: async () => {
        try {
          const response = await authService.getMe()
          if (response.code === 0 && response.data) {
            set({ user: response.data, isAuthenticated: true })
          }
        } catch (error) {
          // Token 无效，清除状态
          useAuthStore.getState().logout()
        }
      },

      // 初始化认证状态（App 启动时调用）
      initializeAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isLoading: false })
          return
        }
        set({ isLoading: true })
        try {
          const response = await authService.getMe()
          if (response.code === 0 && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            // Token 无效
            useAuthStore.getState().logout()
            set({ isLoading: false })
          }
        } catch (error) {
          useAuthStore.getState().logout()
          set({ isLoading: false })
        }
      },

      setAuth: (auth: AuthResponse) => {
        localStorage.setItem('token', auth.token)
        localStorage.setItem('refreshToken', auth.refreshToken)
        set({
          user: auth.user,
          token: auth.token,
          refreshToken: auth.refreshToken,
          isAuthenticated: true
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        // 不持久化 isAuthenticated，改为启动时通过 getMe 验证
      })
    }
  )
)
