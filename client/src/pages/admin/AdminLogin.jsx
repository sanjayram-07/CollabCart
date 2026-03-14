import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminLogin } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { admin, login } = useAuth()
  const [email, setEmail] = useState('admin@collabcart.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  if (admin) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Email and password required')
      return
    }
    setLoading(true)
    try {
      const { data } = await adminLogin(email.trim(), password)
      login(data.token, data.admin?.email || email)
      toast.success('Welcome back, Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)' }}>
              <Lock size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Login</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CollabCart Admin Panel</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@collabcart.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block mx-auto" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            <a href="/" className="hover:underline" style={{ color: 'var(--accent-blue)' }}>← Back to store</a>
          </p>
        </div>
      </div>
    </div>
  )
}
