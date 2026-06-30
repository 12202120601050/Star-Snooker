const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:        { type: String },
  date:            { type: String }, // YYYY-MM-DD business date
  clockIn:         { type: Date, required: true },
  clockOut:        { type: Date, default: null },
  durationMinutes: { type: Number, default: null },
  note:            { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
