import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Users, Copy, Check, Wifi, WifiOff, Sparkles, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { useSocket } from '../../context/SocketContext'

export default function CartHeader({ roomId, activeTab, setActiveTab }) {
  const { session, activeUsers, user, isHost } = useCart()
  const { connected } = useSocket()
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const copyInvite = () => {
    const url = `${window.location.origin}/cart/${roomId}?join=1`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Invite link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="glass-strong border-b sticky top-0 z-30 px-6 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo + Session */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}>
              <ShoppingCart size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:block" style={{ fontFamily: 'Space Grotesk' }}>CollabCart</span>
          </button>

          <div className="w-px h-5" style={{ background: 'var(--border)' }} />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{session?.name || 'Cart Session'}</span>
              {isHost && (
                <span className="tag text-xs" style={{ background: 'rgba(79,99,245,0.15)', color: '#718cff' }}>Host</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{roomId}</span>
              <div className={`flex items-center gap-1 text-xs ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                <span>{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'products'
                ? 'text-white shadow-sm'
                : 'hover:text-white'
            }`}
            style={activeTab === 'products'
              ? { background: 'linear-gradient(135deg, #4f63f5, #7c3aed)', color: 'white' }
              : { color: 'var(--text-secondary)' }}
          >
            <Package size={14} /> Products
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all`}
            style={activeTab === 'ai'
              ? { background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white' }
              : { color: 'var(--text-secondary)' }}
          >
            <Sparkles size={14} /> AI Assistant
          </button>
        </div>

        {/* Right: Users + Invite */}
        <div className="flex items-center gap-3">
          {/* Avatar stack */}
          <div className="hidden sm:flex items-center">
            {activeUsers.slice(0, 5).map((u, i) => (
              <div key={u.socketId || i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white tooltip"
                data-tip={u.username}
                style={{
                  background: u.color || '#4f63f5',
                  borderColor: 'var(--bg-primary)',
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: 5 - i,
                }}>
                {u.username?.[0]?.toUpperCase()}
              </div>
            ))}
            {activeUsers.length > 5 && (
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-primary)', marginLeft: -8, color: 'var(--text-secondary)' }}>
                +{activeUsers.length - 5}
              </div>
            )}
            <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Users size={12} className="inline mr-1" />{activeUsers.length}
            </span>
          </div>

          <button onClick={copyInvite} className="btn-secondary flex items-center gap-2 text-sm py-2">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Invite'}
          </button>
        </div>
      </div>
    </header>
  )
}
