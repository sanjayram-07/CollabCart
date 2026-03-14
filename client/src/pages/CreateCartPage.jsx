import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, User, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { createSession } from '../services/api'
import { useCart } from '../context/CartContext'

const COLORS = ['#4f63f5','#a855f7','#00e5c8','#f59e0b','#f43f5e','#10b981','#3b82f6','#ec4899','#f97316','#06b6d4']

export default function CreateCartPage() {
  const navigate = useNavigate()
  const { saveUser } = useCart()
  const [username, setUsername] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!username.trim()) return toast.error('Enter your username')
    setLoading(true)
    try {
      const { data } = await createSession({ username: username.trim(), sessionName: sessionName.trim(), color })
      saveUser({ userId: data.userId, username: username.trim(), color })
      toast.success('Cart created! Sharing invite link...')
      navigate(`/cart/${data.roomId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4f63f5, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 hover:text-white transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}>
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create a Cart</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>You'll be the host</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <User size={12} className="inline mr-1" /> Your Username
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field"
                placeholder="e.g. Alex"
                maxLength={20}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <Tag size={12} className="inline mr-1" /> Session Name (optional)
              </label>
              <input
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                className="input-field"
                placeholder="e.g. Weekend Groceries"
                maxLength={40}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Pick your avatar color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                      boxShadow: color === c ? `0 0 12px ${c}60` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="card-elevated p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: color }}>
                {username ? username[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-semibold text-sm">{username || 'Your name'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Host · {sessionName || 'My Cart'}</p>
              </div>
              <span className="ml-auto tag text-xs" style={{ background: 'rgba(79,99,245,0.15)', color: '#718cff' }}>Host</span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><ShoppingCart size={17} /> Create Cart & Get Invite Link</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
