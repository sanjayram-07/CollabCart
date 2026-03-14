require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const cartRoutes = require('./routes/cart');
const aiRoutes = require('./routes/ai');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const { initializeSocket } = require('./sockets/cartSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://collabcart-s.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://collabcart-s.vercel.app',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.IO
initializeSocket(io);

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collabcart')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 CollabCart server running on port ${PORT}`);
});

module.exports = { app, io };
