const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    price: Number,
    quantity: Number,
    category: String,
  }],
  subtotal: Number,
  tax: Number,
  grandTotal: Number,
  members: [String],
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Track co-purchase relationships for recommendations
purchaseHistorySchema.post('save', async function (doc) {
  try {
    const Product = require('./Product');
    const productIds = doc.items.map(i => i.productId).filter(Boolean);
    for (const pid of productIds) {
      const others = productIds.filter(id => id && id.toString() !== pid.toString());
      if (others.length > 0) {
        await Product.findByIdAndUpdate(pid, {
          $addToSet: { relatedProducts: { $each: others } },
          $inc: { purchaseCount: 1 },
        });
      }
    }
  } catch (e) {
    console.error('Post-save hook error:', e);
  }
});

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);
