// stores/auth.ts
import { defineStore } from 'pinia'

export type User = {
  id: number
  email: string
  name: string
  shareCode: string
  createdAt: string
  updatedAt: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.user?.name || '',
    userShareCode: (state) => state.user?.shareCode || ''
  },

  actions: {
    async register(name: string, email: string, password: string) {
      this.loading = true
      try {
        const user = await $fetch<User>('/api/auth/register', {
          method: 'POST',
          body: { name, email, password }
        })

        this.user = user
        return user
      } catch (error: any) {
        console.error('Erro ao registrar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const user = await $fetch<User>('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        this.user = user
        return user
      } catch (error: any) {
        console.error('Erro ao fazer login:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })

        this.user = null
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      this.loading = true
      try {
        const user = await $fetch<User>('/api/auth/me')
        this.user = user
        return user
      } catch (error) {
        this.user = null
        return null
      } finally {
        this.loading = false
      }
    }
  }
})

