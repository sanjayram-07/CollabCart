const Product = require('../models/Product');
const aiService = require('../services/ai/aiService');

// GET /api/recommendations/:productId
exports.getRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate('relatedProducts');

    if (!product) return res.status(404).json({ error: 'Product not found' });

    let recommendations = [];

    // First try related products from co-purchase data
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      recommendations = product.relatedProducts.slice(0, 5);
    }

    // Fallback: same category products
    if (recommendations.length < 5) {
      const byCategory = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
      }).sort({ purchaseCount: -1 }).limit(5 - recommendations.length);
      recommendations = [...recommendations, ...byCategory];
    }

    // Fallback: AI tag-based if still not enough
    if (recommendations.length < 3 && product.tags?.length > 0) {
      const byTags = await Product.find({
        tags: { $in: product.tags },
        _id: { $ne: product._id, $nin: recommendations.map(r => r._id) },
      }).limit(5 - recommendations.length);
      recommendations = [...recommendations, ...byTags];
    }

    res.json({ product, recommendations: recommendations.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/budget-recommendation
exports.getBudgetRecommendation = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const products = await Product.find({}).lean();
    const result = await aiService.getBudgetRecommendation(query, products);

    // Add items array for spec compatibility: [{name, price}]
    const items = (result.bundle || []).map(p => ({
      name: p.name,
      price: p.price,
      category: p.category,
    }));

    res.json({ ...result, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
