import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { LayoutDashboard, Package, LogOut, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ProductManagement from '../../components/admin/ProductManagement'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, logout, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('products')

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}>
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{admin?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              <ShoppingCart size={16} />
              Store
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all btn-danger"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === 'products'
                ? 'border-brand-500 text-white'
                : 'border-transparent'
            }`}
            style={activeTab === 'products'
              ? { borderBottomColor: '#4f63f5', color: '#718cff' }
              : { color: 'var(--text-muted)' }}
          >
            <Package size={16} />
            Product Management
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'products' && <ProductManagement />}
      </main>
    </div>
  )
}
