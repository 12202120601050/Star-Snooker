const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount:    { type: Number, required: true },
  note:      { type: String, default: '' },
  date:      { type: String }, // YYYY-MM-DD, set on save
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

expenseSchema.pre('save', function (next) {
  this.date = new Date().toISOString().split('T')[0];
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
