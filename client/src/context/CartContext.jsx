import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('collabcart_user')) || null } catch { return null }
  })
  const [session, setSession] = useState(null)
  const [items, setItems] = useState([])
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, grandTotal: 0 })
  const [activeUsers, setActiveUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [checkoutVote, setCheckoutVote] = useState(null)
  const [checkoutResult, setCheckoutResult] = useState(null)

  const saveUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('collabcart_user', JSON.stringify(userData))
  }, [])

  const addNotification = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev.slice(-4), { id, msg, type }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000)
  }, [])

  const isHost = session && user && session.hostId === user.userId

  return (
    <CartContext.Provider value={{
      user, saveUser,
      session, setSession,
      items, setItems,
      totals, setTotals,
      activeUsers, setActiveUsers,
      notifications, addNotification,
      checkoutVote, setCheckoutVote,
      checkoutResult, setCheckoutResult,
      isHost,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
