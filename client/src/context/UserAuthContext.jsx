import { createContext, useContext, useState, useCallback } from 'react'

const UserAuthContext = createContext(null)
const USER_TOKEN_KEY = 'collabcart_user_token'
const USER_DATA_KEY = 'collabcart_user_data'

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem(USER_TOKEN_KEY)
      const data = localStorage.getItem(USER_DATA_KEY)
      if (!token || !data) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(USER_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
        return null
      }
      return JSON.parse(data)
    } catch {
      return null
    }
  })

  const login = useCallback((token, userData) => {
    localStorage.setItem(USER_TOKEN_KEY, token)
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(USER_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    setUser(null)
  }, [])

  return (
    <UserAuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
  return ctx
}
