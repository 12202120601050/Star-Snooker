const express = require('express');
const r = express.Router();
const c = require('../controllers/canteen.controller');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/auth');

r.get('/', c.getItems); // public — no auth needed for customers ordering

r.post('/', protect, adminOnly, c.createItem);
r.put('/:id', protect, adminOnly, c.updateItem);
r.delete('/:id', protect, adminOnly, c.deleteItem);

module.exports = r;
