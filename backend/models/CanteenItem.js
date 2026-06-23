const mongoose = require('mongoose');

const canteenItemSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  price:  { type: Number, required: true },
  stock:  { type: Number, default: 0 }, // current units in stock
  active: { type: Boolean, default: true },
  order:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CanteenItem', canteenItemSchema);
