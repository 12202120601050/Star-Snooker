const mongoose = require('mongoose');

const salaryPaymentSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  amount:   { type: Number, required: true },
  month:    { type: String }, // YYYY-MM e.g. "2025-07"
  note:     { type: String, default: '' },
  paidBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('SalaryPayment', salaryPaymentSchema);
