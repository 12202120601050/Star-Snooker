const mongoose = require('mongoose');

// A stock tally taken at a shift change: physical count of each item vs system.
const rowSchema = new mongoose.Schema({
  itemId:  { type: String },
  name:    { type: String },
  system:  { type: Number, default: 0 }, // system stock at count time
  counted: { type: Number, default: 0 }, // physically counted
}, { _id: false });

const stockCountSchema = new mongoose.Schema({
  shift:     { type: String, default: 'Evening' }, // Morning / Evening / Night
  rows:      { type: [rowSchema], default: [] },
  countedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:      { type: String },
}, { timestamps: true });

stockCountSchema.pre('save', function (next) {
  const { getBusinessDate } = require('../utils/businessDate');
  this.date = getBusinessDate();
  next();
});

module.exports = mongoose.model('StockCount', stockCountSchema);
