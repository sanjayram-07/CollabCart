import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { verifyMagicLink } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminAuthVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | success | error

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      toast.error('Invalid magic link')
      return
    }

    verifyMagicLink(token)
      .then(({ data }) => {
        login(data.token, data.admin?.email)
        setStatus('success')
        toast.success('Welcome, Admin!')
        navigate('/admin', { replace: true })
      })
      .catch((err) => {
        setStatus('error')
        toast.error(err.response?.data?.error || 'Invalid or expired magic link')
        navigate('/auth', { replace: true })
      })
  }, [searchParams, login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <div className="w-14 h-14 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Verifying magic link...</p>
          </>
        )}
        {status === 'success' && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting to admin...</p>
        )}
      </div>
    </div>
  )
}
