# 🛒 CollabCart — Real-Time Collaborative Shopping Cart

A production-ready multi-user collaborative shopping cart platform where 2–10 users can join via an invite link and manage a shared cart in real time, powered by WebSockets, AI recommendations, and a democratic checkout voting system.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Realtime | Socket.IO WebSockets |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4o-mini (rule-based fallback) |
| Deployment | Docker + Vercel (frontend) + Render (backend) |

---

## ✨ Features

- **Collaborative Sessions** — One host creates a cart, shares invite link; up to 10 users join
- **Real-Time Cart Sync** — Every add/remove/quantity-update broadcasts instantly to all members
- **User Presence** — Live avatar stack, online indicators, join/leave notifications
- **Host-Controlled Checkout** — Host initiates a vote; majority approval required to complete purchase
- **AI "Bought Together"** — After adding an item, AI suggests 5 related products
- **AI Budget Assistant** — Natural language queries like "Birthday outfit for ₹2000" return optimised bundles
- **Session Expiry** — Sessions auto-expire after 24 hours via MongoDB TTL
- **Reconnect Logic** — Socket.IO auto-reconnects; state restored from server on rejoin
- **Admin Management** — Secure admin login, product CRUD (add/edit/delete), dashboard
- **User Auth** — Login/Signup with JWT, split-screen auth UI
- **Admin Magic Link** — Passwordless admin login via email (m.sanjayram07@gmail.com only)

---

## 📁 Folder Structure

```
collabcart/
├── server/
│   ├── controllers/       # cartController, aiController, productController, adminController
│   ├── middleware/        # authAdmin.js — JWT admin protection
│   ├── models/            # User, CartSession, CartItem, Vote, Product, PurchaseHistory, Admin
│   ├── routes/            # cart, ai, products, admin
│   ├── sockets/           # cartSocket.js — all Socket.IO event handlers
│   ├── services/ai/       # aiService.js — OpenAI + rule-based budget engine
│   ├── scripts/           # seed.js — seeds 40+ sample products
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/      # CartHeader, CartSidebar, ProductBrowser, RecommendationBar,
│   │   │   │              #   CheckoutVoteModal, CheckoutResultModal
│   │   │   ├── ai/        # AIPanel
│   │   │   ├── auth/      # LoginForm, SignupForm, AdminMagicLogin, LandingContent
│   │   │   └── ui/        # NotificationFeed
│   │   ├── pages/         # HomePage, CreateCartPage, JoinCartPage, CartDashboard,
│   │   │   │               # ProductListPage, AuthPage, AdminAuthVerify, admin/AdminLogin, admin/AdminDashboard
│   │   ├── context/       # CartContext, SocketContext, AuthContext, UserAuthContext
│   │   ├── services/      # api.js (Axios wrappers)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── render.yaml
└── vercel.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd collabcart

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env:
#   MONGODB_URI=mongodb://localhost:27017/collabcart
#   CLIENT_URL=http://localhost:5173
#   JWT_SECRET=your_secret
#   OPENAI_API_KEY=sk-...   (optional — rule-based fallback works without it)
#   SMTP_USER, SMTP_PASS    (for magic link emails; without these, link is logged to console in dev)

# Client
cp client/.env.example client/.env
# client/.env defaults work for local development
```

### 3. Seed the Database

```bash
cd server
npm run seed
# Seeds 40+ products across Electronics, Fashion, Sports, Home & Kitchen, Books

npm run seed:admin
# Creates admin user: admin@collabcart.com / admin123 (bcrypt hashed)
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:5173**

---

## 🐳 Docker Setup (All-in-one)

```bash
# Build & start everything (MongoDB + Server + Client)
docker-compose up --build

# Access:
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
# MongoDB:  localhost:27017

# Seed data inside container
docker exec collabcart-server node scripts/seed.js

# Stop
docker-compose down
```

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `server`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables in Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `CLIENT_URL` — your Vercel frontend URL
   - `JWT_SECRET` — random secret
   - `OPENAI_API_KEY` — optional
7. Deploy

Alternatively use the included `render.yaml` with **Blueprint** deployments.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `client`
4. Add environment variables:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://collabcart-server.onrender.com`)
   - `VITE_SOCKET_URL` — same Render URL
5. Deploy

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` for Render IPs
3. Copy connection string → paste in Render `MONGODB_URI`
4. Run seed: `node scripts/seed.js` locally pointing to Atlas URI

---

## 🔌 API Reference

### Auth (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login (returns JWT) |
| POST | `/api/auth/signup` | User signup (returns JWT) |

**Login body:** `{ "email": "...", "password": "..." }`  
**Signup body:** `{ "name": "...", "email": "...", "password": "..." }`

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login with password (returns JWT) |
| POST | `/api/admin/logout` | Admin logout |
| POST | `/api/admin/send-magic-link` | Send magic link (m.sanjayram07@gmail.com only) |
| POST | `/api/admin/verify-magic-link` | Verify magic link token (returns JWT) |

**Magic link:** Only `m.sanjayram07@gmail.com` is authorized. Others get "Unauthorized admin email."

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/create` | Create session (returns roomId + userId) |
| POST | `/api/cart/join` | Join existing session |
| GET | `/api/cart/:roomId` | Get session + items + totals |
| POST | `/api/cart/item` | Add item |
| DELETE | `/api/cart/item` | Remove item |
| PUT | `/api/cart/item/quantity` | Update quantity |
| POST | `/api/cart/checkout/start` | Host starts checkout vote |
| POST | `/api/cart/vote` | Cast approve/reject vote |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/recommendations/:productId` | Get 5 related products |
| POST | `/api/ai/budget-recommendation` | Budget bundle suggestion |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (filters: category, search) | Public |
| GET | `/api/products/categories` | All categories | Public |
| GET | `/api/products/:id` | Single product | Public |
| POST | `/api/products` | Create product | Admin (JWT) |
| PUT | `/api/products/:id` | Update product | Admin (JWT) |
| DELETE | `/api/products/:id` | Delete product | Admin (JWT) |

**Product fields:** name, price, category, description, imageUrl, stock

---

## ⚡ Socket.IO Events

### Client → Server
| Event | Payload |
|-------|---------|
| `join_room` | `{ roomId, userId, username, color }` |
| `add_item` | `{ roomId, item }` |
| `remove_item` | `{ roomId, itemId }` |
| `update_quantity` | `{ roomId, itemId, quantity }` |
| `start_checkout` | `{ roomId, userId }` |
| `cast_vote` | `{ roomId, userId, username, vote }` |

### Server → Client
| Event | Description |
|-------|-------------|
| `cart_sync` | Full state on join |
| `cart_updated` | Item add/remove/update |
| `user_joined` | New member joined |
| `user_left` | Member disconnected |
| `active_users_updated` | Updated presence list |
| `checkout_started` | Host started vote |
| `vote_cast` | Someone voted |
| `checkout_result` | Vote concluded |

---

## 🤖 AI Budget Assistant

**With OpenAI key**: Uses GPT-4o-mini with a structured JSON prompt — picks the best product combination from the database that fits your occasion and budget.

**Without OpenAI key**: Rule-based greedy knapsack engine:
1. Parses budget from natural language (₹, numbers)
2. Detects occasion (birthday, office, gym, college, date…)
3. Maps to product categories
4. Greedy-selects items by popularity, optimising for budget fit

Example:
```json
POST /api/ai/budget-recommendation
{ "query": "Birthday outfit for ₹2000" }

Response:
{
  "occasion": "birthday",
  "budget": 2000,
  "bundle": [
    { "name": "Floral Dress", "price": 1499, "category": "Fashion" },
    { "name": "Sunglasses (UV400)", "price": 399, "category": "Fashion" }
  ],
  "total": 1898,
  "remaining": 102,
  "message": "Perfect birthday Fashion bundle within your budget! 🎉"
}
```

---

## 📊 MongoDB Schema Overview

| Collection | Key Fields |
|-----------|-----------|
| `admins` | email, password (bcrypt), createdAt |
| `cartsessions` | roomId, hostId, members[], status, expiresAt (TTL) |
| `cartitems` | roomId, productId, productName, price, quantity, totalPrice, addedBy |
| `votes` | roomId, status, votes[], result.approvals/rejections |
| `products` | name, price, category, description, imageUrl, stock, tags[], relatedProducts[], purchaseCount, createdAt |
| `users` | name, email, password (bcrypt), createdAt |
| `admintokens` | email, token, expiresAt (10 min TTL) |
| `purchasehistories` | roomId, items[], subtotal, tax, grandTotal |

---

## 🛠️ Development Notes

- **Optimistic UI**: Cart emits socket events immediately; server confirms and broadcasts
- **Reconnection**: Socket.IO configured with 5 retry attempts; `cart_sync` restores full state on rejoin
- **Session expiry**: MongoDB TTL index on `expiresAt` (24h) auto-deletes stale sessions
- **Tax calculation**: 18% GST auto-calculated on every cart operation
- **Co-purchase tracking**: `PurchaseHistory` post-save hook updates `relatedProducts` on `Product` documents, improving recommendation quality over time

---

## 📝 License

MIT — built for learning and production use.
