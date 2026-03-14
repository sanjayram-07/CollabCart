import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useCart } from './CartContext'

const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const { setItems, setTotals, setSession, setActiveUsers, addNotification, setCheckoutVote, setCheckoutResult } = useCart()

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('🔌 Socket connected:', socket.id)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
      toast.error('Connection lost. Reconnecting...')
    })

    // Cart sync on join
    socket.on('cart_sync', ({ session, items, totals, activeUsers }) => {
      setSession(session)
      setItems(items)
      setTotals(totals)
      setActiveUsers(activeUsers || [])
    })

    // Real-time cart updates
    socket.on('cart_updated', ({ items, totals, action, byUser, item, itemId }) => {
      setItems(items)
      setTotals(totals)
      const msgs = {
        add_item: `${byUser} added ${item?.productName}`,
        remove_item: `${byUser} removed an item`,
        update_quantity: `${byUser} updated quantity`,
      }
      if (msgs[action]) addNotification(msgs[action], 'cart')
    })

    // User presence
    socket.on('user_joined', ({ username, message, activeUsers }) => {
      setActiveUsers(activeUsers || [])
      addNotification(message || `${username} joined`, 'join')
      toast.success(`👋 ${username} joined the cart!`)
    })

    socket.on('user_left', ({ username, message, activeUsers }) => {
      setActiveUsers(activeUsers || [])
      addNotification(message || `${username} left`, 'leave')
    })

    socket.on('active_users_updated', ({ activeUsers }) => {
      setActiveUsers(activeUsers || [])
    })

    // Checkout flow
    socket.on('checkout_started', ({ vote, message }) => {
      setCheckoutVote(vote)
      setCheckoutResult(null)
      addNotification(message, 'checkout')
      toast('🛒 Checkout vote started!', { icon: '🗳️' })
    })

    socket.on('vote_cast', ({ vote }) => {
      setCheckoutVote(vote)
    })

    socket.on('checkout_result', ({ status, result, message }) => {
      setCheckoutResult({ status, result, message })
      setCheckoutVote(null)
      if (status === 'approved') {
        toast.success('🎉 Order placed successfully!')
      } else {
        toast.error('❌ Checkout rejected')
      }
    })

    socket.on('error', ({ message }) => {
      toast.error(message)
    })

    return () => {
      socket.disconnect()
      socket.removeAllListeners()
    }
  }, [])

  const joinRoom = (roomId, userData) => {
    if (!socketRef.current) return
    if (!socketRef.current.connected) socketRef.current.connect()
    socketRef.current.emit('join_room', { roomId, ...userData })
  }

  const leaveRoom = () => {
    socketRef.current?.disconnect()
  }

  const emit = (event, data) => {
    socketRef.current?.emit(event, data)
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinRoom, leaveRoom, emit }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
