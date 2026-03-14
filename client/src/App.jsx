import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import HomePage from './pages/HomePage'
import CreateCartPage from './pages/CreateCartPage'
import JoinCartPage from './pages/JoinCartPage'
import CartDashboard from './pages/CartDashboard'
import ProductListPage from './pages/ProductListPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AuthPage from './pages/AuthPage'
import AdminAuthVerify from './pages/AdminAuthVerify'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
    <UserAuthProvider>
    <CartProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1d2135',
              color: '#f0f2ff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1d2135' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#1d2135' } },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/create" element={<CreateCartPage />} />
          <Route path="/join" element={<JoinCartPage />} />
          <Route path="/cart/:roomId" element={<CartDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin-auth" element={<AdminAuthVerify />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </CartProvider>
    </UserAuthProvider>
    </AuthProvider>
  )
}
