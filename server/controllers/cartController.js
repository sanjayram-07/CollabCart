const { v4: uuidv4 } = require('uuid');
const CartSession = require('../models/CartSession');
const CartItem = require('../models/CartItem');
const Vote = require('../models/Vote');
const PurchaseHistory = require('../models/PurchaseHistory');

const TAX_RATE = 0.18;

// Create a new cart session
exports.createSession = async (req, res) => {
  try {
    const { username, sessionName, color } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const roomId = uuidv4().slice(0, 8).toUpperCase();
    const userId = uuidv4();

    const session = await CartSession.create({
      roomId,
      hostId: userId,
      hostName: username,
      name: sessionName || `${username}'s Cart`,
      members: [{ userId, username, color: color || '#6366f1', isOnline: true }],
    });

    res.json({ roomId, userId, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join an existing session
exports.joinSession = async (req, res) => {
  try {
    const { roomId, username, color } = req.body;
    if (!roomId || !username) return res.status(400).json({ error: 'roomId and username required' });

    const session = await CartSession.findOne({ roomId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ error: 'Session is not active' });
    if (session.members.length >= session.maxMembers) return res.status(400).json({ error: 'Session is full' });

    const userId = uuidv4();
    const existing = session.members.find(m => m.username === username);
    if (!existing) {
      session.members.push({ userId, username, color: color || '#8b5cf6', isOnline: true });
      await session.save();
    }

    const items = await CartItem.find({ roomId });
    res.json({ roomId, userId: existing ? existing.userId : userId, session, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get session
exports.getSession = async (req, res) => {
  try {
    const { roomId } = req.params;
    const session = await CartSession.findOne({ roomId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const items = await CartItem.find({ roomId });
    const totals = calculateTotals(items);
    res.json({ session, items, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add item
exports.addItem = async (req, res) => {
  try {
    const { roomId, productName, price, quantity, category, image, addedBy, addedByUsername, productId } = req.body;
    const item = await CartItem.create({
      roomId, productName, price, quantity: quantity || 1,
      category, image, addedBy, addedByUsername, productId,
    });
    const items = await CartItem.find({ roomId });
    const totals = calculateTotals(items);
    res.json({ item, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove item
exports.removeItem = async (req, res) => {
  try {
    const { itemId, roomId } = req.body;
    await CartItem.findByIdAndDelete(itemId);
    const items = await CartItem.find({ roomId });
    const totals = calculateTotals(items);
    res.json({ success: true, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { itemId, quantity, roomId } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'Quantity must be >= 1' });
    const item = await CartItem.findByIdAndUpdate(itemId, { quantity }, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.totalPrice = parseFloat((item.price * item.quantity).toFixed(2));
    await item.save();
    const items = await CartItem.find({ roomId });
    const totals = calculateTotals(items);
    res.json({ item, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cast vote for checkout
exports.castVote = async (req, res) => {
  try {
    const { roomId, userId, username, vote } = req.body;
    let voteDoc = await Vote.findOne({ roomId, status: 'pending' });
    if (!voteDoc) return res.status(404).json({ error: 'No active vote' });

    const existing = voteDoc.votes.find(v => v.userId === userId);
    if (existing) return res.status(400).json({ error: 'Already voted' });

    voteDoc.votes.push({ userId, username, vote });
    voteDoc.result.approvals = voteDoc.votes.filter(v => v.vote === 'approve').length;
    voteDoc.result.rejections = voteDoc.votes.filter(v => v.vote === 'reject').length;

    if (voteDoc.votes.length >= voteDoc.totalMembers) {
      voteDoc.status = voteDoc.result.approvals > voteDoc.result.rejections ? 'approved' : 'rejected';
    }
    await voteDoc.save();
    res.json({ vote: voteDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start checkout vote
exports.startCheckout = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const session = await CartSession.findOne({ roomId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.hostId !== userId) return res.status(403).json({ error: 'Only host can start checkout' });

    const existingVote = await Vote.findOne({ roomId, status: 'pending' });
    if (existingVote) return res.status(400).json({ error: 'Vote already in progress' });

    const voteDoc = await Vote.create({
      roomId,
      initiatedBy: userId,
      totalMembers: session.members.filter(m => m.isOnline).length,
    });

    session.status = 'checkout';
    await session.save();
    res.json({ vote: voteDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete checkout after successful vote
exports.completeCheckout = async (req, res) => {
  try {
    const { roomId } = req.body;
    const items = await CartItem.find({ roomId });
    const totals = calculateTotals(items);

    await PurchaseHistory.create({
      roomId,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
        category: i.category,
      })),
      ...totals,
    });

    await CartItem.deleteMany({ roomId });
    await CartSession.findOneAndUpdate({ roomId }, { status: 'completed' });

    res.json({ success: true, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const grandTotal = parseFloat((subtotal + tax).toFixed(2));
  return { subtotal: parseFloat(subtotal.toFixed(2)), tax, grandTotal };
}
