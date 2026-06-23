const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const axios = require('axios');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPviaSMS = async (phone, otp) => {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      { route: 'otp', variables_values: otp, numbers: phone },
      { headers: { authorization: process.env.FAST2SMS_API_KEY } }
    );
    return response.data.return === true;
  } catch (error) {
    console.error('Fast2SMS error:', error.message);
    return false;
  }
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10)
      return res.status(400).json({ message: 'Valid 10-digit phone number required' });

    const existingVerified = await User.findOne({ phone, isVerified: true });
    if (existingVerified && req.body.purpose !== 'forgot-password')
      return res.status(400).json({ message: 'Phone already registered. Please login.' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ phone });
    if (user) {
      user.otp = { code: otp, expiresAt };
      await user.save();
    } else {
      await User.create({ name: 'pending', phone, otp: { code: otp, expiresAt }, isVerified: false, role: 'customer' });
    }

    await sendOTPviaSMS(phone, otp);
    const devOtp = process.env.NODE_ENV === 'development' ? otp : undefined;
    res.json({ message: 'OTP sent successfully', ...(devOtp && { devOtp }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, password, otp } = req.body;
    if (!name || !phone || !password || !otp)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 4)
      return res.status(400).json({ message: 'Password must be at least 4 characters' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Please request OTP first' });
    if (user.isVerified && user.name !== 'pending')
      return res.status(400).json({ message: 'Phone already registered. Please login.' });
    if (!user.otp || user.otp.code !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otp.expiresAt)
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    user.name = name;
    user.password = password;
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, loyaltyPoints: user.loyaltyPoints, totalHoursPlayed: user.totalHoursPlayed }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login — all roles use phone + password
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: 'Phone and password required' });

    const user = await User.findOne({ phone });
    if (!user || !user.isVerified)
      return res.status(401).json({ message: 'Account not found. Please register.' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, loyaltyPoints: user.loyaltyPoints || 0, totalHoursPlayed: user.totalHoursPlayed || 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password — send OTP
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10)
      return res.status(400).json({ message: 'Valid phone number required' });

    const user = await User.findOne({ phone, isVerified: true });
    if (!user)
      return res.status(404).json({ message: 'No account found with this number' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = { code: otp, expiresAt };
    await user.save();

    await sendOTPviaSMS(phone, otp);
    const devOtp = process.env.NODE_ENV === 'development' ? otp : undefined;
    res.json({ message: 'OTP sent successfully', ...(devOtp && { devOtp }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields required' });
    if (newPassword.length < 4)
      return res.status(400).json({ message: 'Password must be at least 4 characters' });

    const user = await User.findOne({ phone, isVerified: true });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (!user.otp || user.otp.code !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otp.expiresAt)
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });

    user.password = newPassword;
    user.otp = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully! Please login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, phone: req.user.phone, role: req.user.role, loyaltyPoints: req.user.loyaltyPoints || 0, totalHoursPlayed: req.user.totalHoursPlayed || 0 }
  });
};

module.exports = { sendOtp, register, login, forgotPassword, resetPassword, getMe };
