import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSocket } from '../context/SocketContext'
import { getSession } from '../services/api'
import CartHeader from '../components/cart/CartHeader'
import CartSidebar from '../components/cart/CartSidebar'
import ProductBrowser from '../components/cart/ProductBrowser'
import CheckoutVoteModal from '../components/cart/CheckoutVoteModal'
import CheckoutResultModal from '../components/cart/CheckoutResultModal'
import AIPanel from '../components/ai/AIPanel'
import NotificationFeed from '../components/ui/NotificationFeed'

export default function CartDashboard() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, setSession, setItems, setTotals, session, checkoutVote, checkoutResult } = useCart()
  const { joinRoom, connected } = useSocket()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'ai'

  useEffect(() => {
    if (!user) {
      navigate(`/join?room=${roomId}`)
      return
    }

    const init = async () => {
      try {
        const { data } = await getSession(roomId)
        setSession(data.session)
        setItems(data.items)
        setTotals(data.totals)
        joinRoom(roomId, { userId: user.userId, username: user.username, color: user.color })
      } catch (err) {
        toast.error('Room not found or expired')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [roomId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading cart session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <CartHeader roomId={roomId} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' ? (
            <ProductBrowser roomId={roomId} />
          ) : (
            <AIPanel roomId={roomId} />
          )}
        </main>

        {/* Cart sidebar */}
        <CartSidebar roomId={roomId} />
      </div>

      {/* Modals */}
      {checkoutVote && <CheckoutVoteModal roomId={roomId} />}
      {checkoutResult && <CheckoutResultModal />}

      {/* Activity feed */}
      <NotificationFeed />
    </div>
  )
}
