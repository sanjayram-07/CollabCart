import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function CheckoutResultModal() {
  const { checkoutResult, setCheckoutResult, setItems, setTotals, isHost } = useCart()
  const navigate = useNavigate()

  if (!checkoutResult) return null

  const approved = checkoutResult.status === 'approved'

  const handleClose = () => {
    setCheckoutResult(null)
    if (approved) {
      setItems([])
      setTotals({ subtotal: 0, tax: 0, grandTotal: 0 })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="card w-full max-w-sm p-8 text-center animate-slide-in-bottom" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex justify-center mb-5">
          {approved ? (
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle size={44} className="text-emerald-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(244,63,94,0.15)' }}>
              <XCircle size={44} className="text-rose-400" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {approved ? '🎉 Order Placed!' : '❌ Checkout Rejected'}
        </h2>

        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          {checkoutResult.message}
        </p>

        <div className="flex gap-3 justify-center text-sm mt-1 mb-6">
          <span className="text-emerald-400">
            ✓ {checkoutResult.result?.approvals || 0} approved
          </span>
          <span className="text-rose-400">
            ✗ {checkoutResult.result?.rejections || 0} rejected
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={handleClose} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <ShoppingBag size={16} />
            {approved ? 'Start New Cart' : 'Continue Shopping'}
          </button>

          {approved && (
            <button onClick={() => navigate('/')} className="btn-secondary w-full py-3">
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
