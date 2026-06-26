// routes/bill.routes.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/bill.controller');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/auth');
r.use(protect, staffOrAdmin);
r.post('/', c.createBill);
r.get('/', c.getBills);
r.get('/today', c.getTodayBills);
r.get('/deleted', adminOnly, c.getDeletedBills); // must be before /:id
r.put('/:id', protect, adminOnly, c.updateBill);
r.delete('/:id', protect, adminOnly, c.deleteBill);
r.put('/:id/restore', protect, adminOnly, c.restoreBill);
r.delete('/:id/permanent', protect, adminOnly, c.permanentDeleteBill);
module.exports = r;
