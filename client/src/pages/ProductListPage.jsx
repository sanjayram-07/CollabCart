import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Tag, ShoppingCart } from 'lucide-react'
import { getProducts, getCategories } from '../services/api'
import toast from 'react-hot-toast'

export default function ProductListPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(['All', ...(data.categories || [])]))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (selectedCategory !== 'All') params.category = selectedCategory
    if (search.trim()) params.search = search.trim()
    getProducts(params)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [selectedCategory, search])

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Browse products. Create or join a cart to shop together.
            </p>
          </div>
          <Link
            to="/create"
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <ShoppingCart size={18} />
            Create Cart
          </Link>
        </div>

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

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat ? 'text-white' : ''
              }`}
              style={
                selectedCategory === cat
                  ? { background: 'linear-gradient(135deg, #4f63f5, #7c3aed)', boxShadow: '0 4px 14px rgba(79,99,245,0.3)' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

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
          <div className="card p-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <Tag size={40} className="mx-auto mb-4 opacity-40" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product._id}
                to="/create"
                className="card group flex flex-col overflow-hidden hover:border-brand-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="relative h-36 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  {(product.imageUrl || product.image) ? (
                    <img
                      src={product.imageUrl || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">📦</div>
                  )}
                  <span
                    className="absolute top-2 left-2 tag text-xs"
                    style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)' }}
                  >
                    {product.category}
                  </span>
                </div>
                <div className="p-3.5 flex flex-col flex-1 gap-2">
                  <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-base" style={{ color: '#718cff' }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
