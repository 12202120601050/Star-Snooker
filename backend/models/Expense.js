const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount:    { type: Number, required: true },
  note:      { type: String, default: '' },
  type:      { type: String, enum: ['out', 'in'], default: 'out' }, // out=expense, in=cash added
  date:      { type: String }, // YYYY-MM-DD, set on save
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

expenseSchema.pre('save', function (next) {
  const { getBusinessDate } = require('../utils/businessDate')
  this.date = getBusinessDate()
  next()
});

module.exports = mongoose.model('Expense', expenseSchema);
