const express = require('express');
const r = express.Router();
const c = require('../controllers/stock.controller');
const { protect, staffOrAdmin } = require('../middleware/auth');

r.use(protect, staffOrAdmin);
r.get('/', c.getCounts);
r.post('/', c.createCount);

module.exports = r;
