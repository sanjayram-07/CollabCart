import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendMagicLink } from '../../services/api'

export default function AdminMagicLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [magicLink, setMagicLink] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }
    setLoading(true)
    setMagicLink(null)
    try {
      const { data } = await sendMagicLink(email.trim())
      setSent(true)
      if (data.magicLink) {
        setMagicLink(data.magicLink)
        toast.success('Click the link below to log in')
      } else {
        toast.success('Check your email for the magic link')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(16,185,129,0.15)' }}>
          <Mail size={24} style={{ color: '#10b981' }} />
        </div>
        <p className="font-semibold mb-1">
          {magicLink ? 'Use the link below' : 'Check your inbox'}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {magicLink
            ? 'SMTP is not configured. Click the link below to log in:'
            : <>We sent a login link to <span className="text-white">{email}</span></>}
        </p>
        {magicLink && (
          <a
            href={magicLink}
            className="block w-full py-3 px-4 rounded-xl text-sm font-semibold mb-4 break-all transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f63f5, #7c3aed)', color: 'white' }}
          >
            Log in to Admin
          </a>
        )}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Link expires in 10 minutes. {!magicLink && 'Check spam folder if needed.'}
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setEmail(''); setMagicLink(null) }}
          className="btn-secondary mt-4 text-sm"
        >
          Use different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Enter your admin email to receive a one-time login link.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field pl-10"
            placeholder="admin@example.com"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Send size={16} />
            Send Magic Link
          </>
        )}
      </button>
    </form>
  )
}
