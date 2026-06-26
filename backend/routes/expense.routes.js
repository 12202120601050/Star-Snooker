const express = require('express');
const r = express.Router();
const c = require('../controllers/expense.controller');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/auth');

r.use(protect, staffOrAdmin);
r.get('/', c.getExpenses);
r.post('/', c.createExpense);
r.delete('/:id', protect, adminOnly, c.deleteExpense);

module.exports = r;
