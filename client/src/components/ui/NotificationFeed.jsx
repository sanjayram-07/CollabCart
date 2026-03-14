import { ShoppingCart, UserPlus, UserMinus, CreditCard } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const ICONS = {
  cart: ShoppingCart,
  join: UserPlus,
  leave: UserMinus,
  checkout: CreditCard,
  info: ShoppingCart,
}

const COLORS = {
  cart: '#718cff',
  join: '#10b981',
  leave: '#f59e0b',
  checkout: '#a855f7',
  info: '#718cff',
}

export default function NotificationFeed() {
  const { notifications } = useCart()

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-2 pointer-events-none">
      {notifications.slice(-3).map(({ id, msg, type }) => {
        const Icon = ICONS[type] || ICONS.info
        const color = COLORS[type] || COLORS.info
        return (
          <div key={id}
            className="glass flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm animate-slide-in-bottom max-w-xs"
            style={{ borderColor: `${color}30` }}>
            <Icon size={13} style={{ color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{msg}</span>
          </div>
        )
      })}
    </div>
  )
}
