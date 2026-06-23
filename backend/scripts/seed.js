const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const CanteenItem = require('../models/CanteenItem');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin (owner)
    if (!(await User.findOne({ phone: '9601818268' }))) {
      await User.create({ name: 'Admin', phone: '9601818268', password: '1234', role: 'admin', isVerified: true, isActive: true });
      console.log('✅ Admin created — Phone: 9601818268 / PIN: 1234');
    } else console.log('⚠️  Admin already exists');

    // Staff
    if (!(await User.findOne({ phone: '9106005507' }))) {
      await User.create({ name: 'Staff', phone: '9106005507', password: '1234', role: 'staff', isVerified: true, isActive: true });
      console.log('✅ Staff created — Phone: 9106005507 / PIN: 1234');
    } else console.log('⚠️  Staff already exists');

    // Canteen items (with stock) — owner can edit/add in the dashboard.
    if ((await CanteenItem.countDocuments()) === 0) {
      await CanteenItem.insertMany([
        { name: 'Cold Drink', price: 25, stock: 0, order: 1 },
        { name: 'Water Bottle', price: 20, stock: 0, order: 2 },
        { name: 'Red Bull', price: 130, stock: 0, order: 3 },
        { name: 'Hell Energy', price: 65, stock: 0, order: 4 },
        { name: 'Cigarette', price: 20, stock: 0, order: 5 },
        { name: 'Chips', price: 20, stock: 0, order: 6 },
      ]);
      console.log('✅ Canteen items seeded');
    } else console.log('⚠️  Canteen items already exist');

    console.log('\n🎱 Star Snooker Academy — Seed Complete!');
    console.log('⚠️  Change the default PINs after first login.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
