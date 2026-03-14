import { Users, Zap, Shield, Sparkles, Star } from 'lucide-react'

export default function LandingContent() {
  const features = [
    { icon: Users, title: 'Up to 10 users', desc: 'Shop together in real time', color: 'text-brand-400' },
    { icon: Zap, title: 'Live sync', desc: 'Instant updates via WebSocket', color: 'text-accent-teal' },
    { icon: Shield, title: 'Vote to checkout', desc: 'Majority approval required', color: 'text-accent-purple' },
    { icon: Sparkles, title: 'AI Assistant', desc: 'Smart budget recommendations', color: 'text-accent-amber' },
  ]

  return (
    <div className="flex flex-col justify-center p-8 lg:p-12">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 w-fit"
        style={{ background: 'rgba(79,99,245,0.12)', border: '1px solid rgba(79,99,245,0.3)', color: '#718cff' }}>
        <Star size={12} fill="currentColor" />
        Real-time collaborative shopping
      </div>

      <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6"
        style={{ fontFamily: 'Space Grotesk' }}>
        Shop together,{' '}
        <span className="gradient-text">decide together</span>
      </h1>

      <p className="text-base lg:text-lg max-w-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
        Create a shared cart, invite your group, and shop in real time.
        AI-powered budget planner included.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        {features.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card p-4 flex flex-col items-start gap-2 text-left hover:border-brand-700 transition-colors">
            <Icon size={20} className={color} />
            <div>
              <p className="font-semibold text-xs">{title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs mt-12" style={{ color: 'var(--text-muted)' }}>
        CollabCart — Built with React, Node.js, Socket.IO & MongoDB
      </p>
    </div>
  )
}
