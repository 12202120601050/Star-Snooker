const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  name: String, price: Number, qty: Number,
}, { _id: false });

const billSchema = new mongoose.Schema({
  tableId:       { type: String, required: true },
  tableName:     { type: String, required: true },
  mode:          { type: String, enum: ['timer', 'frames', 'canteen'], default: 'timer' },
  duration:      { type: Number, default: 0 }, // minutes (timer mode)
  frames:        { type: Number, default: 0 }, // frames played (frames mode)
  players:       { type: [String], default: [] },
  // For loser-pays: per-player amount owed, e.g. [{ name, amount }]
  playerBreakdown: { type: Array, default: [] },
  timeIn:        { type: String },
  timeOut:       { type: String },
  amount:        { type: Number, required: true }, // play (table) amount
  canteenAmount: { type: Number, default: 0 },
  canteenItems:  [cartItemSchema],
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'split', 'credit'], required: true },
  splitCash:     { type: Number, default: 0 }, // legacy — use cashAmount/upiAmount
  splitUpi:      { type: Number, default: 0 }, // legacy
  cashAmount:    { type: Number, default: 0 }, // cash portion (split or full cash)
  upiAmount:     { type: Number, default: 0 }, // upi portion (split or full upi)
  customerName:  { type: String, default: 'Walk-in' },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  note:          { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:          { type: String }, // YYYY-MM-DD for daily filtering
  isDeleted:     { type: Boolean, default: false },
}, { timestamps: true });

billSchema.pre('save', function (next) {
  this.date = new Date().toISOString().split('T')[0];
  next();
});

module.exports = mongoose.model('Bill', billSchema);
