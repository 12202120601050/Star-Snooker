const mongoose = require('mongoose');

// A live table session. Two modes:
//  - 'timer'  : billed by the hour (hourRate × elapsed)
//  - 'frames' : loser-pays — each frame the loser owes frameCharge
const activeSessionSchema = new mongoose.Schema({
  tableId:      { type: String, required: true, unique: true },
  tableName:    { type: String, required: true },
  mode:         { type: String, enum: ['timer', 'frames'], default: 'timer' },
  status:       { type: String, enum: ['running', 'paused'], default: 'running' },
  startTime:    { type: Number, required: true }, // Unix ms
  pausedAt:     { type: Number, default: null },
  totalPausedMs:{ type: Number, default: 0 },
  hourRate:     { type: Number, default: 0 },
  frameCharge:  { type: Number, default: 0 },
  players:      { type: [String], default: [] },  // names, for frames/loser-pays
  framesWonBy:  { type: [Number], default: [] },  // winner index per frame
  customerName: { type: String, default: 'Walk-in' },
  customerId:   { type: String, default: null },
  cart:         { type: Array, default: [] },     // [{ itemId, name, price, qty }]
  note:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ActiveSession', activeSessionSchema);
