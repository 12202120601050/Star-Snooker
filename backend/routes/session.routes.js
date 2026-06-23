const express = require('express');
const r = express.Router();
const c = require('../controllers/session.controller');
const { protect, staffOrAdmin, anyAuth } = require('../middleware/auth');

r.get('/my', protect, anyAuth, c.getMySession);     // customer checks own table
r.use(protect, staffOrAdmin);                        // rest = staff/admin only
r.get('/',                  c.getSessions);
r.post('/',                 c.saveSession);
r.patch('/:tableId/frame',  c.addFrame);             // loser-pays frame result
r.patch('/:tableId',        c.updateSession);
r.delete('/:tableId',       c.deleteSession);
module.exports = r;
