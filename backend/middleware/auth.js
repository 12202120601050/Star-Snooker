const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'customer') {
        // Customer JWT — look up in Customer model
        const customer = await Customer.findById(decoded.id).select('-pin');
        if (!customer) return res.status(401).json({ message: 'Customer not found' });
        req.user = { ...customer.toObject(), role: 'customer' };
      } else {
        // Admin/Staff JWT — look up in User model
        req.user = await User.findById(decoded.id).select('-password -otp');
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) return next();
  res.status(403).json({ message: 'Staff or Admin access required' });
};

// Any authenticated user (admin, staff, or customer)
const anyAuth = (req, res, next) => {
  if (req.user) return next();
  res.status(403).json({ message: 'Authentication required' });
};

module.exports = { protect, adminOnly, staffOrAdmin, anyAuth };
