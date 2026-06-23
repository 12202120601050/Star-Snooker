const mongoose = require('mongoose');

const khataSchema = new mongoose.Schema({
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  type:         { type: String, enum: ['gave','got'], required: true },
  amount:       { type: Number, required: true },
  note:         { type: String, default: '' },
  linkedBillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('KhataTransaction', khataSchema);
