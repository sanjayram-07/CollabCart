import { useState } from 'react'
import { User, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { signup } from '../../services/api'

export default function SignupForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = []
    if (!name.trim()) errs.push('Name is required')
    if (!email.trim()) errs.push('Email is required')
    if (!password) errs.push('Password is required')
    else if (password.length < 6) errs.push('Password must be at least 6 characters')
    if (errs.length) {
      toast.error(errs[0])
      return
    }
    setLoading(true)
    try {
      const { data } = await signup(name.trim(), email.trim(), password)
      onSuccess?.(data.token, data.user)
      toast.success('Account created!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field pl-10"
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field pl-10"
            placeholder="you@example.com"
            autoComplete="email"
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
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block mx-auto" />
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}
