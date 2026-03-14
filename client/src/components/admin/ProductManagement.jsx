import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api'

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: '',
  })

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts({ limit: 100 })
      setProducts(data.products)
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      price: '',
      category: '',
      description: '',
      imageUrl: '',
      stock: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingProduct(p)
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      description: p.description || '',
      imageUrl: p.imageUrl || p.image || '',
      stock: String(p.stock ?? 0),
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      category: form.category.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      stock: parseInt(form.stock, 10) || 0,
    }
    if (!payload.name || !payload.category) {
      toast.error('Name and category required')
      return
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product added')
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Products</h2>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="shimmer h-24 rounded-lg" />
              <div className="shimmer h-4 rounded w-3/4" />
              <div className="shimmer h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--text-muted)' }}>
          <p>No products yet. Add your first product.</p>
          <button onClick={openAddModal} className="btn-primary mt-4">Add Product</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Image</th>
                <th className="pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Price</th>
                <th className="pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Category</th>
                <th className="pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Stock</th>
                <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-3 pr-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                      {(p.imageUrl || p.image) ? (
                        <img src={p.imageUrl || p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium text-sm">{p.name}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: '#718cff' }}>{fmt(p.price)}</td>
                  <td className="py-3 pr-4">
                    <span className="tag text-xs" style={{ background: 'var(--bg-elevated)' }}>{p.category}</span>
                  </td>
                  <td className="py-3 pr-4 text-sm">{p.stock ?? 0}</td>
                  <td className="py-3 flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-lg transition-colors hover:bg-white/5"
                      title="Edit"
                    >
                      <Edit2 size={16} style={{ color: 'var(--accent-blue)' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-2 rounded-lg transition-colors hover:bg-white/5"
                      title="Delete"
                    >
                      <Trash2 size={16} style={{ color: '#f43f5e' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Formal Shirt"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="input-field"
                  placeholder="900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Category *</label>
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Clothing"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field min-h-[80px]"
                  placeholder="Slim fit cotton shirt"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="input-field"
                  placeholder="https://... or shirt.png"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className="input-field"
                  placeholder="50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
