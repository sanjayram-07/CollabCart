import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://collabcart-s.vercel.app'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
}) 

// Attach auth token when available (admin first, then user)
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('collabcart_admin_token')
  const userToken = localStorage.getItem('collabcart_user_token')
  const token = adminToken || userToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Cart APIs
export const createSession = (data) => api.post('/cart/create', data)
export const joinSession = (data) => api.post('/cart/join', data)
export const getSession = (roomId) => api.get(`/cart/${roomId}`)
export const addItem = (data) => api.post('/cart/item', data)
export const removeItem = (data) => api.delete('/cart/item', { data })
export const updateQuantity = (data) => api.put('/cart/item/quantity', data)
export const startCheckout = (data) => api.post('/cart/checkout/start', data)
export const castVote = (data) => api.post('/cart/vote', data)

// Product APIs
export const getProducts = (params) => api.get('/products', { params })
export const getCategories = () => api.get('/products/categories')

// AI APIs
export const getRecommendations = (productId) => api.get(`/ai/recommendations/${productId}`)
export const getBudgetRecommendation = (query) => api.post('/ai/budget-recommendation', { query })

// User Auth APIs
export const login = (email, password) => api.post('/auth/login', { email, password })
export const signup = (name, email, password) => api.post('/auth/signup', { name, email, password })

// Admin APIs
export const adminLogin = (email, password) => api.post('/admin/login', { email, password })
export const adminLogout = () => api.post('/admin/logout')
export const sendMagicLink = (email) => api.post('/admin/send-magic-link', { email })
export const verifyMagicLink = (token) => api.post('/admin/verify-magic-link', { token })

// Product CRUD (admin) - requires Authorization: Bearer <token>
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const getProduct = (id) => api.get(`/products/${id}`)

export default api
