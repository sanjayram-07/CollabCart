const Product = require('../models/Product');

function sanitizeProductInput(body) {
  return {
    name: body.name?.trim(),
    price: typeof body.price === 'number' ? body.price : parseFloat(body.price),
    category: body.category?.trim(),
    description: body.description?.trim() || '',
    imageUrl: body.imageUrl?.trim() || body.image?.trim() || '',
    stock: typeof body.stock === 'number' ? body.stock : parseInt(body.stock, 10) || 0,
  };
}

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, description, imageUrl, stock } = sanitizeProductInput(req.body);
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required.' });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Valid price is required.' });
    }

    const product = await Product.create({
      name,
      price,
      category,
      description: description || '',
      image: imageUrl || '',
      imageUrl: imageUrl || '',
      stock: isNaN(stock) || stock < 0 ? 0 : stock,
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, description, imageUrl, stock } = sanitizeProductInput(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (imageUrl !== undefined) {
      product.image = imageUrl;
      product.imageUrl = imageUrl;
    }
    if (!isNaN(price) && price >= 0) product.price = price;
    if (!isNaN(stock) && stock >= 0) product.stock = stock;

    await product.save();
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter).limit(Number(limit)).sort({ purchaseCount: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
