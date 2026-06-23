// routes/bill.routes.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/bill.controller');
const { protect, staffOrAdmin } = require('../middleware/auth');
r.use(protect, staffOrAdmin);
r.post('/', c.createBill);
r.get('/', c.getBills);
r.get('/today', c.getTodayBills);
module.exports = r;
