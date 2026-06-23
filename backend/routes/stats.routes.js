const express = require('express');
const r = express.Router();
const c = require('../controllers/stats.controller');
const { protect, adminOnly } = require('../middleware/auth');
r.get('/', protect, adminOnly, c.getStats);
module.exports = r;
