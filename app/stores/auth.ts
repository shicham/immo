import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  permissions?: string[]
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    isAdmin: state => state.user?.role === 'admin',
    hasPermission: state => (permission: string) => {
      return state.user?.permissions?.includes(permission) || false
    },
    userInitials: (state) => {
      if (!state.user?.name)
        return ''
      const names = state.user.name.split(' ')
      return names.map(n => n[0]).join('').toUpperCase()
    },
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiBaseUrl}${config.public.apiLoginEndpoint}`

      try {
        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { email, password },
          headers: { 'Content-Type': 'application/json' },
        })

        if (error.value || !data.value) {
          throw new Error(error.value?.data?.message || 'Erreur de connexion au serveur.')
        }

        const response = data.value as {
          success: boolean
          message: string
          data?: {
            user: User
            accessToken: string
            refreshToken: string
          }
        }

        if (!response.success) {
          throw new Error(response.message || 'Identifiants incorrects.')
        }

        if (!response.data?.accessToken) {
          throw new Error('Réponse inattendue du serveur.')
        }

        // Update store state
        this.user = response.data.user
        this.accessToken = response.data.accessToken
        this.refreshToken = response.data.refreshToken
        this.isAuthenticated = true

        // Store in localStorage as backup
        if (import.meta.client) {
          localStorage.setItem('accessToken', response.data.accessToken)
          localStorage.setItem('refreshToken', response.data.refreshToken)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }

        return { success: true }
      }
      catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue.' }
      }
      finally {
        this.isLoading = false
      }
    },

    async register(name: string, email: string, password: string, confirmPassword: string) {
      this.isLoading = true
      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiBaseUrl}/api/v1/auth/register`

      try {
        // Validation
        if (!name || !email || !password || !confirmPassword) {
          throw new Error('Tous les champs sont requis.')
        }

        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.')
        }

        if (password.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères.')
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        if (!passwordRegex.test(password)) {
          throw new Error('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.')
        }

        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { name, email, password },
          headers: { 'Content-Type': 'application/json' },
        })

        if (error.value || !data.value) {
          throw new Error(error.value?.data?.message || 'Erreur lors de l\'inscription.')
        }

        const response = data.value as {
          success: boolean
          message: string
          data?: {
            user: User
            accessToken: string
            refreshToken: string
          }
        }

        if (!response.success) {
          throw new Error(response.message || 'Erreur lors de l\'inscription.')
        }

        if (response.data?.accessToken) {
          // Auto-login after registration
          this.user = response.data.user
          this.accessToken = response.data.accessToken
          this.refreshToken = response.data.refreshToken
          this.isAuthenticated = true

          if (import.meta.client) {
            localStorage.setItem('accessToken', response.data.accessToken)
            localStorage.setItem('refreshToken', response.data.refreshToken)
            localStorage.setItem('user', JSON.stringify(response.data.user))
          }
        }

        return { success: true, message: response.message }
      }
      catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue.' }
      }
      finally {
        this.isLoading = false
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        return false
      }

      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiBaseUrl}/api/v1/auth/refresh`

      try {
        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { refreshToken: this.refreshToken },
          headers: { 'Content-Type': 'application/json' },
        })

        if (error.value || !data.value) {
          this.logout()
          return false
        }

        const response = data.value as {
          success: boolean
          data?: {
            accessToken: string
          }
        }

        if (response.success && response.data?.accessToken) {
          this.accessToken = response.data.accessToken
          if (import.meta.client) {
            localStorage.setItem('accessToken', response.data.accessToken)
          }
          return true
        }

        this.logout()
        return false
      }
      catch {
        this.logout()
        return false
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false

      if (import.meta.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      navigateTo('/login')
    },

    async initializeAuth() {
      if (!import.meta.client)
        return

      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userStr = localStorage.getItem('user')

      if (accessToken && refreshToken && userStr) {
        try {
          this.user = JSON.parse(userStr)
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          this.isAuthenticated = true
        }
        catch {
          this.logout()
        }
      }
    },

    checkPermission(permission: string): boolean {
      return this.user?.permissions?.includes(permission) || false
    },

    hasRole(role: string): boolean {
      return this.user?.role === role
    },
  },
})
