import { useState } from 'react'
import { CreditCard, ThumbsUp, ThumbsDown, Clock, Users } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSocket } from '../../context/SocketContext'

export default function CheckoutVoteModal({ roomId }) {
  const { checkoutVote, user, totals } = useCart()
  const { emit } = useSocket()
  const [voted, setVoted] = useState(false)

  if (!checkoutVote) return null

  const hasVoted = checkoutVote.votes?.some(v => v.userId === user?.userId)
  const approvals = checkoutVote.result?.approvals || 0
  const rejections = checkoutVote.result?.rejections || 0
  const total = checkoutVote.totalMembers || 1
  const voted_count = checkoutVote.votes?.length || 0

  const castVote = (vote) => {
    emit('cast_vote', {
      roomId,
      userId: user.userId,
      username: user.username,
      vote,
    })
    setVoted(true)
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="card w-full max-w-md p-6 animate-slide-in-bottom" style={{ background: 'var(--bg-elevated)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}>
            <CreditCard size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Checkout Vote</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Majority approval needed to proceed
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-4 mb-5">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>ORDER SUMMARY</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
              <span>{fmt(totals.tax)}</span>
            </div>
            <hr className="section-divider my-1" />
            <div className="flex justify-between font-bold">
              <span>Grand Total</span>
              <span className="gradient-text">{fmt(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Users size={12} className="inline mr-1" />
              {voted_count}/{total} voted
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400">✓ {approvals}</span>
              <span className="text-rose-400">✗ {rejections}</span>
            </div>
          </div>

          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
            <div className="h-full flex">
              {approvals > 0 && (
                <div className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(approvals / total) * 100}%` }} />
              )}
              {rejections > 0 && (
                <div className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${(rejections / total) * 100}%` }} />
              )}
            </div>
          </div>

          {/* Who voted */}
          {checkoutVote.votes?.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {checkoutVote.votes.map((v, i) => (
                <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                  v.vote === 'approve'
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-rose-400 bg-rose-400/10'
                }`}>
                  {v.username} {v.vote === 'approve' ? '✓' : '✗'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Vote buttons */}
        {!hasVoted && !voted ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => castVote('approve')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
            >
              <ThumbsUp size={16} /> Approve
            </button>
            <button
              onClick={() => castVote('reject')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}
            >
              <ThumbsDown size={16} /> Reject
            </button>
          </div>
        ) : (
          <div className="text-center py-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
            <Clock size={18} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-semibold">Vote cast!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Waiting for other members...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
