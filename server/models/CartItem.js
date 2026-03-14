const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  category: { type: String, default: 'General' },
  image: { type: String, default: '' },
  addedBy: { type: String, required: true },
  addedByUsername: { type: String, required: true },
  totalPrice: { type: Number },
}, { timestamps: true });

cartItemSchema.pre('save', function (next) {
  this.totalPrice = parseFloat((this.price * this.quantity).toFixed(2));
  next();
});

module.exports = mongoose.model('CartItem', cartItemSchema);
