import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const ADMIN_TOKEN_KEY = 'collabcart_admin_token'
const ADMIN_EMAIL_KEY = 'collabcart_admin_email'

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        localStorage.removeItem(ADMIN_EMAIL_KEY)
        return null
      }
      const email = localStorage.getItem(ADMIN_EMAIL_KEY) || payload.email || 'admin'
      return { token, email }
    } catch {
      return null
    }
  })

  const login = useCallback((token, email) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
    if (email) localStorage.setItem(ADMIN_EMAIL_KEY, email)
    setAdmin({ token, email: email || 'admin' })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_EMAIL_KEY)
    setAdmin(null)
  }, [])

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAdmin: !!admin, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
