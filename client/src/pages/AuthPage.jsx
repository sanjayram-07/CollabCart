import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Shield } from 'lucide-react'
import LandingContent from '../components/auth/LandingContent'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'
import AdminMagicLogin from '../components/auth/AdminMagicLogin'
import { useUserAuth } from '../context/UserAuthContext'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'login', label: 'Login', icon: LogIn },
  { id: 'signup', label: 'Signup', icon: UserPlus },
  { id: 'admin', label: 'Admin Login', icon: Shield },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const { login: userLogin } = useUserAuth()
  const { login: adminLogin } = useAuth()
  const [activeTab, setActiveTab] = useState('login')

  const handleUserSuccess = (token, user) => {
    userLogin(token, user)
    navigate('/')
  }

  const handleAdminSuccess = (token, admin) => {
    adminLogin(token, admin.email)
    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--bg-primary)' }}>
      {/* Background mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4f63f5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      </div>

      {/* Left: Landing content */}
      <div className="relative z-10 flex-1 flex items-center lg:min-h-screen">
        <div className="w-full max-w-xl mx-auto">
          <LandingContent />
        </div>
      </div>

      {/* Right: Auth card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="card p-6 lg:p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Welcome</h2>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-elevated)' }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === id ? 'text-white' : ''
                  }`}
                  style={
                    activeTab === id
                      ? { background: 'linear-gradient(135deg, #4f63f5, #7c3aed)', boxShadow: '0 2px 8px rgba(79,99,245,0.3)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[240px]">
              {activeTab === 'login' && (
                <div className="animate-fade-in">
                  <LoginForm onSuccess={handleUserSuccess} />
                </div>
              )}
              {activeTab === 'signup' && (
                <div className="animate-fade-in">
                  <SignupForm onSuccess={handleUserSuccess} />
                </div>
              )}
              {activeTab === 'admin' && (
                <div className="animate-fade-in">
                  <AdminMagicLogin onSuccess={handleAdminSuccess} />
                </div>
              )}
            </div>

            <p className="text-center mt-6">
              <a href="/" className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>
                ← Back to home
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
