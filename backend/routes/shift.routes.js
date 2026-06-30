const express = require('express');
const router = express.Router();
const { protect, adminOnly, staffOrAdmin } = require('../middleware/auth');
const { clockIn, clockOut, getMyShift, getTodayShifts } = require('../controllers/shift.controller');

router.use(protect, staffOrAdmin);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/my', getMyShift);
router.get('/today', adminOnly, getTodayShifts);

module.exports = router;
