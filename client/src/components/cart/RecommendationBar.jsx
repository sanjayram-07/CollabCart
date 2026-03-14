import { X, Sparkles, Plus } from 'lucide-react'

export default function RecommendationBar({ recommendations, lastAdded, onAdd, onDismiss }) {
  return (
    <div className="card mb-6 p-4 border-amber-500/20" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: '#f59e0b' }} />
          <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
            Bought together with <span className="text-white">{lastAdded?.name}</span>
          </span>
        </div>
        <button onClick={onDismiss} className="hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {recommendations.map(rec => (
          <div key={rec._id} className="shrink-0 flex items-center gap-3 card-elevated p-3 rounded-xl min-w-[180px]">
            <div className="w-10 h-10 rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)' }}>
              {(rec.imageUrl || rec.image)
                ? <img src={rec.imageUrl || rec.image} alt={rec.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{rec.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#718cff' }}>₹{rec.price?.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={() => onAdd(rec)}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Plus size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
