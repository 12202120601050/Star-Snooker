// routes/khata.routes.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/khata.controller');
const { protect, staffOrAdmin } = require('../middleware/auth');
r.use(protect, staffOrAdmin);
r.get('/', c.getAllBalances);
r.get('/:customerId', c.getTransactions);
r.post('/:customerId', c.addTransaction);
module.exports = r;
