require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const ADMIN_EMAIL = 'admin@collabcart.com';
const ADMIN_PASSWORD = 'admin123';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collabcart');
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      existing.password = ADMIN_PASSWORD;
      await existing.save();
      console.log('✅ Admin password updated');
    } else {
      await Admin.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      console.log('✅ Admin user created');
    }

    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed admin failed:', err);
    process.exit(1);
  }
}

seedAdmin();
