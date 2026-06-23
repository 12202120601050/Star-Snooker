const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, required: true, unique: true, trim: true },
  pin:     { type: String, required: true }, // hashed bcrypt
  memberSince:        { type: Date, default: Date.now },
  loyaltyPoints:      { type: Number, default: 0 },
  totalSessions:      { type: Number, default: 0 },
  totalSpent:         { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
