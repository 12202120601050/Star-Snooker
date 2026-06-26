const express = require('express');
const r = express.Router();
const c = require('../controllers/canteen.controller');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/auth');

r.get('/', c.getItems); // public — no auth needed for customers ordering
r.get('/deleted', protect, adminOnly, c.getDeletedItems); // must be before /:id

r.post('/', protect, adminOnly, c.createItem);
r.put('/:id', protect, adminOnly, c.updateItem);
r.delete('/:id', protect, adminOnly, c.deleteItem);
r.put('/:id/restore', protect, adminOnly, c.restoreItem);
r.delete('/:id/permanent', protect, adminOnly, c.permanentDeleteItem);

module.exports = r;
