const express = require('express');
const r = express.Router();
const c = require('../controllers/customer.controller');
const { protect, staffOrAdmin, adminOnly, anyAuth } = require('../middleware/auth');

// Public — customer self-service
r.post('/register', c.registerCustomer);
r.post('/login', c.loginCustomer);

// Customer self-profile (own data only)
r.get('/me', protect, anyAuth, c.getMe);

// Staff + Admin
r.use(protect, staffOrAdmin);
r.get('/', c.getCustomers);
r.post('/', c.createCustomer);
r.get('/deleted', adminOnly, c.getDeletedCustomers); // must be before /:id
r.get('/:id', c.getCustomer);
r.put('/:id', c.updateCustomer);

// Admin only
r.delete('/:id', protect, adminOnly, c.deleteCustomer);
r.put('/:id/restore', protect, adminOnly, c.restoreCustomer);
r.delete('/:id/permanent', protect, adminOnly, c.permanentDeleteCustomer);

module.exports = r;
