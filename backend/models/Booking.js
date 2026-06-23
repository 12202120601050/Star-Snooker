const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  stationId:    { type: String, required: true },
  stationName:  { type: String, required: true },
  customerName: { type: String, required: true },
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  players:      { type: Number, default: 1 },
  bookingDate:  { type: String, required: true }, // YYYY-MM-DD
  bookingTime:  { type: String, required: true }, // HH:MM
  note:         { type: String, default: '' },
  status:       { type: String, enum: ['upcoming','started','cancelled'], default: 'upcoming' },
  reminderFired:{ type: Boolean, default: false },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
