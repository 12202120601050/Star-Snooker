const express = require('express');
const router = express.Router();
const { sendOtp, register, login, forgotPassword, resetPassword, getMe, verifyPin, changePin, createStaff, getStaff, deactivateStaff, setSalary } = require('../controllers/auth.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/verify-pin', protect, verifyPin);
router.post('/change-pin', protect, changePin);

// Admin — staff management
router.get('/staff', protect, adminOnly, getStaff);
router.post('/staff', protect, adminOnly, createStaff);
router.delete('/staff/:id', protect, adminOnly, deactivateStaff);
router.put('/staff/:id/salary', protect, adminOnly, setSalary);

module.exports = router;
