require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  // Electronics
  { name: 'Laptop (Core i5)', price: 45000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', description: 'High-performance laptop for work and study', tags: ['laptop', 'computer', 'work', 'office'], purchaseCount: 120 },
  { name: 'Wireless Mouse', price: 999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', description: 'Ergonomic wireless mouse', tags: ['mouse', 'computer', 'office', 'laptop'], purchaseCount: 340 },
  { name: 'Mechanical Keyboard', price: 3500, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', description: 'RGB mechanical gaming keyboard', tags: ['keyboard', 'computer', 'gaming', 'office'], purchaseCount: 210 },
  { name: 'USB-C Hub (7-in-1)', price: 2200, category: 'Electronics', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400', description: 'Multi-port USB-C hub', tags: ['hub', 'usb', 'laptop', 'office'], purchaseCount: 180 },
  { name: 'Laptop Bag 15"', price: 1800, category: 'Electronics', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', description: 'Waterproof laptop backpack', tags: ['bag', 'laptop', 'backpack', 'office'], purchaseCount: 260 },
  { name: 'Wireless Earbuds', price: 4999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400', description: 'Active noise cancellation earbuds', tags: ['earbuds', 'audio', 'wireless', 'music'], purchaseCount: 300 },
  { name: '27" Monitor', price: 18000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', description: '4K IPS monitor', tags: ['monitor', 'display', 'office', 'computer'], purchaseCount: 95 },
  { name: 'Smartphone (Mid-range)', price: 18000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', description: '6.7" AMOLED, 5G smartphone', tags: ['phone', 'smartphone', 'mobile', '5g'], purchaseCount: 450 },
  { name: 'Phone Case', price: 399, category: 'Electronics', image: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400', description: 'Clear protective phone case', tags: ['case', 'phone', 'protection', 'accessory'], purchaseCount: 520 },
  { name: 'Screen Protector', price: 299, category: 'Electronics', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', description: 'Tempered glass screen protector', tags: ['screen', 'protector', 'phone', 'accessory'], purchaseCount: 480 },
  { name: 'Portable Charger 20000mAh', price: 1599, category: 'Electronics', image: 'https://images.unsplash.com/photo-1609592806596-b6c6a08c6e84?w=400', description: 'Fast charging power bank', tags: ['charger', 'powerbank', 'travel', 'mobile'], purchaseCount: 350 },
  { name: 'Webcam 1080p', price: 3200, category: 'Electronics', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400', description: 'HD webcam with mic for meetings', tags: ['webcam', 'camera', 'office', 'wfh'], purchaseCount: 140 },

  // Fashion
  { name: 'Classic White Shirt', price: 899, category: 'Fashion', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', description: 'Premium cotton formal shirt', tags: ['shirt', 'formal', 'office', 'white', 'fashion'], purchaseCount: 380 },
  { name: 'Slim Fit Chinos', price: 1299, category: 'Fashion', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', description: 'Slim fit casual chinos', tags: ['pants', 'chinos', 'casual', 'fashion', 'college'], purchaseCount: 290 },
  { name: 'Sports Sneakers', price: 2499, category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', description: 'Lightweight running sneakers', tags: ['shoes', 'sneakers', 'sports', 'casual', 'gym'], purchaseCount: 410 },
  { name: 'Denim Jacket', price: 1899, category: 'Fashion', image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400', description: 'Classic blue denim jacket', tags: ['jacket', 'denim', 'casual', 'college', 'fashion'], purchaseCount: 220 },
  { name: 'Floral Dress', price: 1499, category: 'Fashion', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', description: 'Elegant floral summer dress', tags: ['dress', 'floral', 'party', 'birthday', 'fashion'], purchaseCount: 315 },
  { name: 'Formal Blazer', price: 3499, category: 'Fashion', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', description: 'Tailored formal blazer', tags: ['blazer', 'formal', 'office', 'professional', 'fashion'], purchaseCount: 175 },
  { name: 'Casual T-Shirt Pack (3)', price: 799, category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', description: 'Pack of 3 cotton t-shirts', tags: ['tshirt', 'casual', 'college', 'everyday', 'fashion'], purchaseCount: 490 },
  { name: 'Leather Belt', price: 599, category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', description: 'Genuine leather dress belt', tags: ['belt', 'leather', 'formal', 'accessory', 'fashion'], purchaseCount: 280 },
  { name: 'Sunglasses (UV400)', price: 799, category: 'Fashion', image: 'https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=400', description: 'Polarized UV400 sunglasses', tags: ['sunglasses', 'accessory', 'travel', 'casual', 'fashion'], purchaseCount: 330 },
  { name: 'Formal Oxford Shoes', price: 2999, category: 'Fashion', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', description: 'Genuine leather oxford shoes', tags: ['shoes', 'formal', 'office', 'leather', 'fashion'], purchaseCount: 190 },

  // Sports & Fitness
  { name: 'Yoga Mat', price: 799, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1601925228008-8a7b80c7c476?w=400', description: 'Non-slip premium yoga mat', tags: ['yoga', 'mat', 'fitness', 'gym', 'exercise'], purchaseCount: 260 },
  { name: 'Resistance Bands Set', price: 599, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', description: 'Set of 5 resistance bands', tags: ['resistance', 'bands', 'gym', 'workout', 'fitness'], purchaseCount: 200 },
  { name: 'Gym Gloves', price: 499, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', description: 'Weightlifting gym gloves', tags: ['gloves', 'gym', 'workout', 'fitness'], purchaseCount: 185 },
  { name: 'Protein Shaker Bottle', price: 399, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1589894404892-7310b92ea7a2?w=400', description: '700ml BPA-free shaker bottle', tags: ['shaker', 'protein', 'gym', 'fitness', 'bottle'], purchaseCount: 320 },
  { name: 'Running Shoes', price: 3499, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', description: 'Cushioned running shoes', tags: ['shoes', 'running', 'gym', 'fitness', 'sport'], purchaseCount: 275 },
  { name: 'Sports Bag', price: 1299, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', description: 'Durable gym sports bag', tags: ['bag', 'gym', 'sports', 'fitness'], purchaseCount: 230 },
  { name: 'Jump Rope', price: 349, category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1601925228008-8a7b80c7c476?w=400', description: 'Speed skipping rope with counter', tags: ['jumprope', 'cardio', 'gym', 'fitness'], purchaseCount: 175 },

  // Home & Kitchen
  { name: 'Electric Kettle 1.5L', price: 1299, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description: 'Fast boil electric kettle', tags: ['kettle', 'kitchen', 'appliance', 'home'], purchaseCount: 295 },
  { name: 'Air Fryer 4L', price: 4999, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400', description: 'Digital air fryer with presets', tags: ['airfryer', 'kitchen', 'cooking', 'appliance', 'home'], purchaseCount: 180 },
  { name: 'Desk Organizer Set', price: 699, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', description: 'Bamboo desk organizer', tags: ['organizer', 'desk', 'office', 'home', 'wfh'], purchaseCount: 220 },
  { name: 'Water Purifier Bottle', price: 1499, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', description: 'UV sterilization water bottle', tags: ['water', 'bottle', 'purifier', 'travel', 'home'], purchaseCount: 195 },
  { name: 'Bamboo Cutting Board', price: 599, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', description: 'Eco-friendly bamboo cutting board', tags: ['cutting', 'board', 'kitchen', 'cooking', 'home'], purchaseCount: 240 },
  { name: 'LED Desk Lamp', price: 1199, category: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1572502742864-2b4efb87be4e?w=400', description: 'Touch dimmable desk lamp', tags: ['lamp', 'light', 'desk', 'office', 'home', 'study'], purchaseCount: 270 },

  // Books & Stationery
  { name: 'Premium Notebook A5', price: 299, category: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', description: 'Hardcover dotted notebook', tags: ['notebook', 'stationery', 'study', 'college', 'writing'], purchaseCount: 380 },
  { name: 'Gel Pen Set (12)', price: 199, category: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400', description: 'Smooth writing gel pens', tags: ['pen', 'stationery', 'writing', 'study', 'college'], purchaseCount: 420 },
  { name: 'Highlighter Set (6 colors)', price: 249, category: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400', description: 'Pastel highlighter set', tags: ['highlighter', 'stationery', 'study', 'college'], purchaseCount: 310 },
  { name: 'Scientific Calculator', price: 899, category: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400', description: '417 functions scientific calculator', tags: ['calculator', 'study', 'college', 'math', 'stationery'], purchaseCount: 195 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collabcart');
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products`);

    // Set up some related products for laptop scenario
    const laptop = inserted.find(p => p.name.includes('Laptop (Core'));
    const mouse = inserted.find(p => p.name.includes('Wireless Mouse'));
    const keyboard = inserted.find(p => p.name.includes('Mechanical Keyboard'));
    const hub = inserted.find(p => p.name.includes('USB-C Hub'));
    const bag = inserted.find(p => p.name.includes('Laptop Bag'));
    const monitor = inserted.find(p => p.name.includes('Monitor'));

    if (laptop) {
      await Product.findByIdAndUpdate(laptop._id, {
        relatedProducts: [mouse._id, keyboard._id, hub._id, bag._id, monitor._id],
      });
    }
    console.log('✅ Related products linked');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
