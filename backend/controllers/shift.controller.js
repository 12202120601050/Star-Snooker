const Shift = require('../models/Shift');
const { getBusinessDate } = require('../utils/businessDate');

// POST /api/shifts/clock-in
exports.clockIn = async (req, res) => {
  try {
    const date = getBusinessDate();
    const existing = await Shift.findOne({ userId: req.user._id, date, clockOut: null });
    if (existing) return res.status(400).json({ message: 'Already clocked in', shift: existing });
    const shift = await Shift.create({
      userId: req.user._id,
      userName: req.user.name,
      date,
      clockIn: new Date(),
    });
    res.status(201).json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Failed to clock in' });
  }
};

// POST /api/shifts/clock-out
exports.clockOut = async (req, res) => {
  try {
    const date = getBusinessDate();
    const shift = await Shift.findOne({ userId: req.user._id, date, clockOut: null });
    if (!shift) return res.status(400).json({ message: 'Not clocked in' });
    shift.clockOut = new Date();
    shift.durationMinutes = Math.round((shift.clockOut - shift.clockIn) / 60000);
    await shift.save();
    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Failed to clock out' });
  }
};

// GET /api/shifts/my — my active shift today
exports.getMyShift = async (req, res) => {
  try {
    const date = getBusinessDate();
    const shift = await Shift.findOne({ userId: req.user._id, date, clockOut: null });
    res.json(shift || null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shift' });
  }
};

// GET /api/shifts/today — all shifts today (admin)
exports.getTodayShifts = async (req, res) => {
  try {
    const date = getBusinessDate();
    const shifts = await Shift.find({ date }).sort({ clockIn: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shifts' });
  }
};
