import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, Users, CreditCard, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { useSocket } from '../../context/SocketContext'

export default function CartSidebar({ roomId }) {
  const { items, totals, user, isHost, activeUsers, session } = useCart()
  const { emit } = useSocket()
  const [checkingOut, setCheckingOut] = useState(false)

  const handleRemove = (itemId) => {
    emit('remove_item', { roomId, itemId })
  }

  const handleQtyChange = (itemId, delta, currentQty) => {
    const newQty = currentQty + delta
    if (newQty < 1) {
      emit('remove_item', { roomId, itemId })
    } else {
      emit('update_quantity', { roomId, itemId, quantity: newQty })
    }
  }

  const handleStartCheckout = () => {
    if (items.length === 0) return toast.error('Cart is empty')
    setCheckingOut(true)
    emit('start_checkout', { roomId, userId: user.userId })
    setTimeout(() => setCheckingOut(false), 2000)
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <aside className="w-80 shrink-0 border-l flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={17} style={{ color: '#718cff' }} />
            <span className="font-semibold text-sm">Cart</span>
            {items.length > 0 && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: '#4f63f5' }}>{items.length}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Users size={12} />
            {activeUsers.length} online
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto cart-scroll p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <ShoppingBag size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Add products to get started</p>
          </div>
        ) : (
          items.map(item => (
            <CartItem
              key={item._id}
              item={item}
              user={user}
              onRemove={handleRemove}
              onQtyChange={handleQtyChange}
            />
          ))
        )}
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
              <span>{fmt(totals.tax)}</span>
            </div>
            <hr className="section-divider my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="gradient-text text-lg">{fmt(totals.grandTotal)}</span>
            </div>
          </div>

          {isHost ? (
            <button
              onClick={handleStartCheckout}
              disabled={checkingOut || session?.status === 'checkout'}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {checkingOut ? (
                <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CreditCard size={16} /> Start Checkout Vote</>
              )}
            </button>
          ) : (
            <div className="text-center py-3 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              <CreditCard size={14} className="inline mr-1.5" />
              Waiting for host to checkout
            </div>
          )}

          {session?.status === 'checkout' && (
            <p className="text-center text-xs mt-2" style={{ color: '#f59e0b' }}>
              🗳️ Vote in progress...
            </p>
          )}
        </div>
      )}

      {/* Active users */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--text-muted)' }}>
          ACTIVE MEMBERS ({activeUsers.length})
        </p>
        <div className="space-y-2">
          {activeUsers.slice(0, 5).map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: u.color || '#4f63f5' }}>
                {u.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{u.username}</span>
              <div className="badge-online ml-auto shrink-0" />
            </div>
          ))}
          {activeUsers.length > 5 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{activeUsers.length - 5} more</p>
          )}
        </div>
      </div>
    </aside>
  )
}

function CartItem({ item, user, onRemove, onQtyChange }) {
  const isOwn = item.addedBy === user?.userId

  return (
    <div className="card p-3 group animate-slide-in-bottom">
      <div className="flex gap-2.5">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
          {item.image
            ? <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{item.productName}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>by {item.addedByUsername}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onQtyChange(item._id, -1, item.quantity)}
                className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'var(--bg-elevated)' }}>
                <Minus size={10} />
              </button>
              <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => onQtyChange(item._id, 1, item.quantity)}
                className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'var(--bg-elevated)' }}>
                <Plus size={10} />
              </button>
            </div>

            <span className="text-xs font-bold" style={{ color: '#718cff' }}>
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          onClick={() => onRemove(item._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
