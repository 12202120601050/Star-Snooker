const express = require('express');
const r = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const wa = require('../services/whatsapp.service');

// GET /api/whatsapp/status — check connection
r.get('/status', protect, adminOnly, (req, res) => {
  res.json(wa.getStatus());
});

// GET /api/whatsapp/qr — get QR code image (base64)
r.get('/qr', protect, adminOnly, (req, res) => {
  const qr = wa.getQr();
  if (!qr) return res.status(404).json({ message: 'No QR available — already connected or loading' });
  res.json({ qr });
});

// POST /api/whatsapp/test — send test message to admin
r.post('/test', protect, adminOnly, async (req, res) => {
  const wa = require('../services/whatsapp.service');
  const sent = await wa.sendMessage('8866312761', '🎮 Plug & Play Lounge\n\n✅ WhatsApp notifications are working!');
  res.json({ success: sent });
});

module.exports = r;
