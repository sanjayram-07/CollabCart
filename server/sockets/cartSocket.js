const CartSession = require('../models/CartSession');
const CartItem = require('../models/CartItem');
const Vote = require('../models/Vote');

const TAX_RATE = 0.18;

function calculateTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  return { subtotal: parseFloat(subtotal.toFixed(2)), tax, grandTotal: parseFloat((subtotal + tax).toFixed(2)) };
}

function initializeSocket(io) {
  const activeRooms = new Map(); // roomId -> Map<socketId, userInfo>

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join room
    socket.on('join_room', async ({ roomId, userId, username, color }) => {
      try {
        const session = await CartSession.findOne({ roomId });
        if (!session) return socket.emit('error', { message: 'Room not found' });

        socket.join(roomId);
        socket.userId = userId;
        socket.username = username;
        socket.roomId = roomId;

        if (!activeRooms.has(roomId)) activeRooms.set(roomId, new Map());
        activeRooms.get(roomId).set(socket.id, { userId, username, color, socketId: socket.id });

        // Update member online status
        await CartSession.updateOne(
          { roomId, 'members.userId': userId },
          { $set: { 'members.$.isOnline': true } }
        );

        const items = await CartItem.find({ roomId });
        const totals = calculateTotals(items);
        const updatedSession = await CartSession.findOne({ roomId });
        const activeUsers = Array.from(activeRooms.get(roomId).values());

        // Send current state to joining user
        socket.emit('cart_sync', { session: updatedSession, items, totals, activeUsers });

        // Notify others
        socket.to(roomId).emit('user_joined', {
          userId, username, color,
          message: `${username} joined the cart`,
          activeUsers,
        });

        io.to(roomId).emit('active_users_updated', { activeUsers });
        console.log(`👤 ${username} joined room ${roomId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Add item
    socket.on('add_item', async ({ roomId, item }) => {
      try {
        const newItem = await CartItem.create({ roomId, ...item });
        const items = await CartItem.find({ roomId });
        const totals = calculateTotals(items);

        io.to(roomId).emit('cart_updated', {
          action: 'add_item',
          item: newItem,
          items,
          totals,
          byUser: socket.username,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Remove item
    socket.on('remove_item', async ({ roomId, itemId }) => {
      try {
        await CartItem.findByIdAndDelete(itemId);
        const items = await CartItem.find({ roomId });
        const totals = calculateTotals(items);

        io.to(roomId).emit('cart_updated', {
          action: 'remove_item',
          itemId,
          items,
          totals,
          byUser: socket.username,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Update quantity
    socket.on('update_quantity', async ({ roomId, itemId, quantity }) => {
      try {
        const item = await CartItem.findById(itemId);
        if (!item) return socket.emit('error', { message: 'Item not found' });
        item.quantity = Math.max(1, quantity);
        item.totalPrice = parseFloat((item.price * item.quantity).toFixed(2));
        await item.save();

        const items = await CartItem.find({ roomId });
        const totals = calculateTotals(items);

        io.to(roomId).emit('cart_updated', {
          action: 'update_quantity',
          item,
          items,
          totals,
          byUser: socket.username,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Start checkout
    socket.on('start_checkout', async ({ roomId, userId }) => {
      try {
        const session = await CartSession.findOne({ roomId });
        if (!session) return socket.emit('error', { message: 'Session not found' });
        if (session.hostId !== userId) return socket.emit('error', { message: 'Only host can start checkout' });

        const onlineMembers = session.members.filter(m => m.isOnline);
        const voteDoc = await Vote.create({
          roomId,
          initiatedBy: userId,
          totalMembers: onlineMembers.length,
        });

        await CartSession.updateOne({ roomId }, { status: 'checkout' });

        io.to(roomId).emit('checkout_started', {
          vote: voteDoc,
          initiatedBy: socket.username,
          message: `${socket.username} started checkout! Cast your vote.`,
          expiresAt: voteDoc.expiresAt,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Cast vote
    socket.on('cast_vote', async ({ roomId, userId, username, vote }) => {
      try {
        const voteDoc = await Vote.findOne({ roomId, status: 'pending' });
        if (!voteDoc) return socket.emit('error', { message: 'No active vote' });

        const alreadyVoted = voteDoc.votes.find(v => v.userId === userId);
        if (alreadyVoted) return socket.emit('error', { message: 'Already voted' });

        voteDoc.votes.push({ userId, username, vote });
        voteDoc.result.approvals = voteDoc.votes.filter(v => v.vote === 'approve').length;
        voteDoc.result.rejections = voteDoc.votes.filter(v => v.vote === 'reject').length;

        const totalVoted = voteDoc.votes.length;
        const majority = Math.ceil(voteDoc.totalMembers / 2);

        if (totalVoted >= voteDoc.totalMembers || voteDoc.result.approvals >= majority || voteDoc.result.rejections > voteDoc.totalMembers - majority) {
          voteDoc.status = voteDoc.result.approvals >= majority ? 'approved' : 'rejected';
        }

        await voteDoc.save();

        io.to(roomId).emit('vote_cast', {
          vote: voteDoc,
          latestVote: { userId, username, vote },
        });

        if (voteDoc.status !== 'pending') {
          const items = await CartItem.find({ roomId });
          const totals = calculateTotals(items);

          if (voteDoc.status === 'approved') {
            // Complete the checkout
            const PurchaseHistory = require('../models/PurchaseHistory');
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
            await CartSession.updateOne({ roomId }, { status: 'completed' });
          } else {
            await CartSession.updateOne({ roomId }, { status: 'active' });
          }

          io.to(roomId).emit('checkout_result', {
            status: voteDoc.status,
            result: voteDoc.result,
            totals: voteDoc.status === 'approved' ? totals : null,
            message: voteDoc.status === 'approved'
              ? '🎉 Checkout approved! Order placed successfully.'
              : '❌ Checkout rejected. Continue shopping.',
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator (user is browsing/adding)
    socket.on('user_activity', ({ roomId, activity }) => {
      socket.to(roomId).emit('user_activity', {
        userId: socket.userId,
        username: socket.username,
        activity,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const { roomId, userId, username } = socket;
      if (!roomId) return;

      const room = activeRooms.get(roomId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) activeRooms.delete(roomId);
      }

      try {
        await CartSession.updateOne(
          { roomId, 'members.userId': userId },
          { $set: { 'members.$.isOnline': false } }
        );
      } catch {}

      const activeUsers = room ? Array.from(room.values()) : [];
      io.to(roomId).emit('user_left', {
        userId, username,
        message: `${username} left the cart`,
        activeUsers,
      });
      io.to(roomId).emit('active_users_updated', { activeUsers });

      console.log(`👋 ${username} disconnected from ${roomId}`);
    });
  });
}

module.exports = { initializeSocket };
