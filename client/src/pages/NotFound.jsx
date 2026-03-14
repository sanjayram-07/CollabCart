import { useNavigate } from 'react-router-dom'
import { Home, ShoppingCart } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <div>
        <p className="text-8xl font-black mb-4 opacity-10" style={{ fontFamily: 'JetBrains Mono' }}>404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>This cart session may have expired.</p>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2 mx-auto">
          <Home size={16} /> Back to Home
        </button>
      </div>
    </div>
  )
}
