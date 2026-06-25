const express = require('express');
const r = express.Router();
const c = require('../controllers/setup.controller');
const { protect, adminOnly } = require('../middleware/auth');

// One-time seed, protected by the SEED_KEY env var. No auth (chicken-and-egg:
// it creates the first admin), so the secret key is what protects it.
r.get('/seed', c.seed);
r.delete('/reset', protect, adminOnly, c.reset);

module.exports = r;
