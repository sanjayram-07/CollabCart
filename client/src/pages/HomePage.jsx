import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Users, Zap, Shield, Sparkles, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()

  const features = [
    { icon: Users, title: 'Up to 10 users', desc: 'Shop together in real time', color: 'text-brand-400' },
    { icon: Zap, title: 'Live sync', desc: 'Instant updates via WebSocket', color: 'text-accent-teal' },
    { icon: Shield, title: 'Vote to checkout', desc: 'Majority approval required', color: 'text-accent-purple' },
    { icon: Sparkles, title: 'AI Assistant', desc: 'Smart budget recommendations', color: 'text-accent-amber' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Background mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4f63f5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00e5c8 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}>
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>CollabCart</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/products')} className="text-sm" style={{ color: 'var(--text-secondary)' }}>Products</button>
          <button onClick={() => navigate('/auth')} className="text-sm" style={{ color: 'var(--text-secondary)' }}>Login</button>
          <button onClick={() => navigate('/join')} className="btn-secondary text-sm">Join Cart</button>
          <button onClick={() => navigate('/create')} className="btn-primary text-sm">Create Cart</button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-12 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(79,99,245,0.12)', border: '1px solid rgba(79,99,245,0.3)', color: '#718cff' }}>
          <Star size={12} fill="currentColor" />
          Real-time collaborative shopping
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ fontFamily: 'Space Grotesk' }}>
          Shop together,{' '}
          <span className="gradient-text">decide together</span>
        </h1>

        <p className="text-lg max-w-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
          Create a shared cart, invite your group, and shop in real time.
          AI-powered budget planner included.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate('/create')}
            className="btn-primary flex items-center gap-2 text-base px-7 py-3.5"
          >
            Create a Cart <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/join')}
            className="btn-secondary flex items-center gap-2 text-base px-7 py-3.5"
          >
            Join with Invite Link
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl w-full">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-5 flex flex-col items-start gap-3 text-left hover:border-brand-700 transition-colors">
              <Icon size={22} className={color} />
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-3xl w-full text-left">
          <h2 className="text-2xl font-bold mb-8 text-center">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create a session', desc: 'Host creates a cart and gets a shareable invite link.' },
              { step: '02', title: 'Invite your group', desc: 'Share the link — up to 10 people can join instantly.' },
              { step: '03', title: 'Shop & vote', desc: 'Add items together. Host starts checkout, group votes to confirm.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card-elevated p-5">
                <span className="text-4xl font-black opacity-20" style={{ fontFamily: 'JetBrains Mono' }}>{step}</span>
                <h3 className="font-semibold mt-2 mb-1">{title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        CollabCart — Built with React, Node.js, Socket.IO & MongoDB
      </footer>
    </div>
  )
}
