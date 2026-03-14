const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  tags: [String],
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  purchaseCount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
