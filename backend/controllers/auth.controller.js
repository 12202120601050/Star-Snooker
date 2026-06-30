const User = require('../models/User');
const SalaryPayment = require('../models/SalaryPayment');
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

// POST /api/auth/verify-pin — verify the logged-in user's password (for action gating)
const verifyPin = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Wrong PIN' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
};

// POST /api/auth/change-pin — change password (requires current password)
const changePin = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new PIN required' });
    if (newPassword.length < 4) return res.status(400).json({ message: 'New PIN must be at least 4 digits' });
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current PIN is wrong' });
    user.password = newPassword;
    await user.save();
    res.json({ ok: true, message: 'PIN changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change PIN' });
  }
};

// POST /api/auth/staff — admin creates a staff account (no OTP needed)
const createStaff = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: 'Name, phone and PIN are required' });
    const exists = await User.findOne({ phone });
    if (exists) {
      if (exists.isActive && exists.role === 'staff') return res.status(400).json({ message: 'Staff with this phone already exists' });
      // Re-activate or promote
      exists.name = name; exists.password = password; exists.role = 'staff'; exists.isVerified = true; exists.isActive = true;
      await exists.save();
      return res.json({ message: 'Staff account updated', user: { _id: exists._id, name, phone, role: 'staff' } });
    }
    const user = await User.create({ name, phone, password, role: 'staff', isVerified: true, isActive: true });
    res.status(201).json({ message: 'Staff created', user: { _id: user._id, name, phone, role: 'staff' } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create staff' });
  }
};

// GET /api/auth/staff — list all staff accounts (admin only)
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password -otp').sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
};

// DELETE /api/auth/staff/:id — deactivate staff (admin only)
const deactivateStaff = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Staff deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate staff' });
  }
};

// PUT /api/auth/staff/:id/salary — set monthly salary (admin only)
const setSalary = async (req, res) => {
  try {
    const { monthlySalary } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { monthlySalary: Number(monthlySalary) || 0 }, { new: true }).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'Staff not found' });
    res.json({ monthlySalary: user.monthlySalary });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update salary' });
  }
};

// POST /api/auth/staff/:id/pay — record a salary payment (admin only)
const paySalary = async (req, res) => {
  try {
    const { amount, month, note } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Amount required' });
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    const payment = await SalaryPayment.create({
      userId: staff._id,
      userName: staff.name,
      amount: Number(amount),
      month: month || new Date().toISOString().slice(0, 7),
      note: note || '',
      paidBy: req.user._id,
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record payment' });
  }
};

// GET /api/auth/staff/:id/payments — salary payment history (admin only)
const getSalaryPayments = async (req, res) => {
  try {
    const payments = await SalaryPayment.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(24);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

module.exports = { sendOtp, register, login, forgotPassword, resetPassword, getMe, verifyPin, changePin, createStaff, getStaff, deactivateStaff, setSalary, paySalary, getSalaryPayments };
