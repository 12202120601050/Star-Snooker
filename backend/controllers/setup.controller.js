const mongoose = require('mongoose');
const User = require('../models/User');
const CanteenItem = require('../models/CanteenItem');

// GET /api/setup/seed?key=SEED_KEY — one-time setup. Creates the default admin,
// staff and canteen items if they don't exist. Guarded by the SEED_KEY env var
// so it can't be triggered by anyone. Idempotent (safe to call more than once).
exports.seed = async (req, res) => {
  try {
    if (!process.env.SEED_KEY || req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = { admin: 'exists', staff: 'exists', canteen: 'exists' };

    if (!(await User.findOne({ phone: '9601818268' }))) {
      await User.create({ name: 'Admin', phone: '9601818268', password: '1234', role: 'admin', isVerified: true, isActive: true });
      result.admin = 'created (9601818268 / 1234)';
    }
    if (!(await User.findOne({ phone: '9106005507' }))) {
      await User.create({ name: 'Staff', phone: '9106005507', password: '1234', role: 'staff', isVerified: true, isActive: true });
      result.staff = 'created (9106005507 / 1234)';
    }
    if ((await CanteenItem.countDocuments()) === 0) {
      await CanteenItem.insertMany([
        { name: 'Cold Drink', price: 25, stock: 0, order: 1 },
        { name: 'Water Bottle', price: 20, stock: 0, order: 2 },
        { name: 'Red Bull', price: 130, stock: 0, order: 3 },
        { name: 'Hell Energy', price: 65, stock: 0, order: 4 },
        { name: 'Cigarette', price: 20, stock: 0, order: 5 },
        { name: 'Chips', price: 20, stock: 0, order: 6 },
      ]);
      result.canteen = 'seeded';
    }

    res.json({ ok: true, message: 'Setup complete. Change the default PINs after first login.', result });
  } catch (err) {
    res.status(500).json({ message: 'Setup failed', error: err.message });
  }
};

// DELETE /api/setup/reset?key=SEED_KEY — wipes all transactional data.
// Keeps Users. Intended for one-time test-data cleanup only.
exports.reset = async (req, res) => {
  try {
    if (!process.env.SEED_KEY || req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const db = mongoose.connection.db;
    const WIPE = ['bills', 'activesessions', 'customers', 'khatatransactions', 'canteentransactions', 'stockcounts', 'bookings', 'leaderboards'];
    const existing = (await db.listCollections().toArray()).map(c => c.name.toLowerCase());
    const results = {};
    for (const name of WIPE) {
      if (existing.includes(name)) {
        const r = await db.collection(name).deleteMany({});
        results[name] = r.deletedCount;
      } else {
        results[name] = 'not found';
      }
    }
    res.json({ ok: true, message: 'Database reset complete. Users untouched.', results });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};
