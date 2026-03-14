import { useState } from 'react'
import { Sparkles, Send, Plus, ShoppingBag, Zap, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBudgetRecommendation } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { useSocket } from '../../context/SocketContext'

const EXAMPLES = [
  'Birthday outfit for ₹2000',
  'Office setup under ₹5000',
  'College essentials under ₹1500',
  'Date night look for ₹3000',
  'Gym starter kit under ₹2000',
]

export default function AIPanel({ roomId }) {
  const { user } = useCart()
  const { emit } = useSocket()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [addedIds, setAddedIds] = useState(new Set())

  const handleSearch = async (q = query) => {
    const finalQuery = q || query
    if (!finalQuery.trim()) return toast.error('Enter a query')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await getBudgetRecommendation(finalQuery)
      setResult(data)
      setAddedIds(new Set())
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI service unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBundle = () => {
    if (!result?.bundle) return
    result.bundle.forEach(product => {
      emit('add_item', {
        roomId,
        item: {
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
          image: product.image,
          addedBy: user.userId,
          addedByUsername: user.username,
        },
      })
    })
    setAddedIds(new Set(result.bundle.map(p => p._id)))
    toast.success(`Added ${result.bundle.length} items to cart!`)
  }

  const handleAddOne = (product) => {
    emit('add_item', {
      roomId,
      item: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
        image: product.image,
        addedBy: user.userId,
        addedByUsername: user.username,
      },
    })
    setAddedIds(prev => new Set([...prev, product._id]))
    toast.success(`Added ${product.name}`)
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Budget Assistant</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Describe what you need and your budget — AI builds the perfect bundle
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="card p-4 mb-6" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="input-field flex-1"
            placeholder="e.g. Birthday outfit for ₹2000"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {loading
              ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Example prompts */}
      {!result && !loading && (
        <div className="mb-8">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            TRY THESE EXAMPLES
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); handleSearch(ex) }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#f59e0b',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Zap size={22} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <p className="font-semibold">AI is building your bundle...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Analyzing products and budget constraints</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="animate-fade-in">
          {/* Summary card */}
          <div className="card p-5 mb-4" style={{ borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-lg">{result.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="tag text-xs" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    Occasion: {result.occasion}
                  </span>
                  <span className="tag text-xs" style={{ background: 'rgba(79,99,245,0.12)', color: '#718cff' }}>
                    Budget: {fmt(result.budget)}
                  </span>
                  {result.source === 'openai' && (
                    <span className="tag text-xs" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                      ✨ GPT-4o
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddBundle}
                disabled={addedIds.size === result.bundle?.length}
                className="btn-primary flex items-center gap-2 text-sm shrink-0 ml-4"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
              >
                <ShoppingBag size={14} />
                {addedIds.size === result.bundle?.length ? 'Added!' : 'Add Bundle'}
              </button>
            </div>

            {/* Budget bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Budget used</span>
                <span style={{ color: 'var(--text-secondary)' }}>{fmt(result.total)} / {fmt(result.budget)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((result.total / result.budget) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {fmt(result.remaining)} remaining
              </p>
            </div>
          </div>

          {/* Bundle items */}
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            SUGGESTED BUNDLE ({result.bundle?.length || 0} items)
          </p>

          <div className="space-y-2">
            {result.bundle?.map((product, i) => (
              <BundleItem
                key={product._id || i}
                product={product}
                isAdded={addedIds.has(product._id)}
                onAdd={() => handleAddOne(product)}
              />
            ))}
          </div>

          {/* New search */}
          <button
            onClick={() => { setResult(null); setQuery('') }}
            className="btn-secondary w-full mt-4 py-2.5 text-sm"
          >
            Try a Different Query
          </button>
        </div>
      )}
    </div>
  )
}

function BundleItem({ product, isAdded, onAdd }) {
  return (
    <div className={`card p-4 flex items-center gap-4 transition-all ${isAdded ? 'opacity-60' : ''}`}>
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
        {(product.imageUrl || product.image)
          ? <img src={product.imageUrl || product.image} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="tag text-xs" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            {product.category}
          </span>
          {product.reason && (
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {product.reason}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold" style={{ color: '#f59e0b' }}>
          ₹{product.price?.toLocaleString('en-IN')}
        </span>
        <button
          onClick={onAdd}
          disabled={isAdded}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: isAdded ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            border: `1px solid ${isAdded ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            color: isAdded ? '#10b981' : '#f59e0b',
          }}
        >
          {isAdded ? '✓' : <Plus size={14} />}
        </button>
      </div>
    </div>
  )
}
