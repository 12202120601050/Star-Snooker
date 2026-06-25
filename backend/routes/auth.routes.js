const express = require('express');
const router = express.Router();
const { sendOtp, register, login, forgotPassword, resetPassword, getMe, verifyPin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/verify-pin', protect, verifyPin);

module.exports = router;
