const Booking = require('../models/Booking');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, createdBy: req.user._id });
    // WhatsApp confirmation if phone provided
    try {
      if (req.body.customerPhone) {
        const wa = require('../services/whatsapp.service');
        wa.sendMessage(req.body.customerPhone, wa.bookingMessage({
          customerName: req.body.customerName,
          stationName: req.body.stationName,
          bookingTime: req.body.bookingTime,
          players: req.body.players
        }));
      }
    } catch {}
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// GET /api/bookings — all today's bookings (optionally filter by stationId)
exports.getBookings = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = { status: 'upcoming', bookingDate: today };
    if (req.query.stationId) query.stationId = req.query.stationId;
    const bookings = await Booking.find(query).sort({ bookingTime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// PATCH /api/bookings/:id — update status (started / cancelled)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};
