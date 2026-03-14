import { useState, useEffect } from 'react'
import { Search, Plus, Star, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, getCategories, getRecommendations } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { useSocket } from '../../context/SocketContext'
import RecommendationBar from './RecommendationBar'

export default function ProductBrowser({ roomId }) {
  const { user } = useCart()
  const { emit } = useSocket()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [lastAdded, setLastAdded] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, search])

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories()
      setCategories(['All', ...data.categories])
    } catch {}
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory !== 'All') params.category = selectedCategory
      if (search.trim()) params.search = search.trim()
      const { data } = await getProducts(params)
      setProducts(data.products)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product) => {
    setAddingId(product._id)
    try {
      emit('add_item', {
        roomId,
        item: {
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
          image: product.imageUrl || product.image,
          addedBy: user.userId,
          addedByUsername: user.username,
        },
      })
      setLastAdded(product)
      toast.success(`Added ${product.name}`)

      // Fetch AI recommendations
      try {
        const { data } = await getRecommendations(product._id)
        setRecommendations(data.recommendations)
      } catch {}
    } catch {
      toast.error('Failed to add item')
    } finally {
      setTimeout(() => setAddingId(null), 600)
    }
  }

  return (
    <div>
      {/* Recommendation bar */}
      {recommendations.length > 0 && (
        <RecommendationBar
          recommendations={recommendations}
          lastAdded={lastAdded}
          onAdd={handleAddToCart}
          onDismiss={() => setRecommendations([])}
        />
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search products..."
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat ? 'text-white' : ''
            }`}
            style={selectedCategory === cat
              ? { background: 'linear-gradient(135deg, #4f63f5, #7c3aed)', boxShadow: '0 4px 14px rgba(79,99,245,0.3)' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="shimmer h-36 rounded-lg" />
              <div className="shimmer h-4 rounded w-3/4" />
              <div className="shimmer h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <Tag size={32} className="mx-auto mb-3 opacity-40" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onAdd={handleAddToCart}
              isAdding={addingId === product._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, onAdd, isAdding }) {
  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`

  return (
    <div className="card group flex flex-col overflow-hidden hover:border-brand-700 transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-36 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        {(product.imageUrl || product.image) ? (
          <img src={product.imageUrl || product.image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">📦</div>
        )}
        <span className="absolute top-2 left-2 tag text-xs"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}>
          {product.category}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1 gap-2">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>

        <div className="flex items-center gap-1.5 mt-auto">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <Star size={10} className="inline" fill="currentColor" style={{ color: '#f59e0b' }} />
            {product.rating?.toFixed(1) || '4.0'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: '#718cff' }}>{formatPrice(product.price)}</span>
          <button
            onClick={() => onAdd(product)}
            disabled={isAdding}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}
          >
            {isAdding
              ? <span className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
              : <Plus size={16} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}
