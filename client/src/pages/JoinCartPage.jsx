import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Users, ArrowLeft, Link } from 'lucide-react'
import toast from 'react-hot-toast'
import { joinSession } from '../services/api'
import { useCart } from '../context/CartContext'

const COLORS = ['#4f63f5','#a855f7','#00e5c8','#f59e0b','#f43f5e','#10b981','#3b82f6','#ec4899']

export default function JoinCartPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { saveUser } = useCart()
  const [roomId, setRoomId] = useState(params.get('room') || '')
  const [username, setUsername] = useState('')
  const [color, setColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)])
  const [loading, setLoading] = useState(false)

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!roomId.trim()) return toast.error('Enter a room ID')
    if (!username.trim()) return toast.error('Enter your username')
    setLoading(true)
    try {
      const { data } = await joinSession({ roomId: roomId.trim().toUpperCase(), username: username.trim(), color })
      saveUser({ userId: data.userId, username: username.trim(), color })
      toast.success(`Joining ${data.session.name}...`)
      navigate(`/cart/${data.roomId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[20%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 hover:text-white transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Join a Cart</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter the room ID from your invite</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <Link size={12} className="inline mr-1" /> Room ID
              </label>
              <input
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                className="input-field font-mono tracking-widest text-center text-lg"
                placeholder="e.g. AB12CD34"
                maxLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your Username
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field"
                placeholder="e.g. Sam"
                maxLength={20}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Pick your avatar color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Users size={17} /> Join Cart</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
