const Customer = require('../models/Customer');
const KhataTransaction = require('../models/KhataTransaction');
const Bill = require('../models/Bill');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GET /api/customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true })
      .select('-pin')
      .sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

// GET /api/customers/:id — profile + transactions + bills
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-pin');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const transactions = await KhataTransaction.find({ customerId: customer._id })
      .sort({ createdAt: -1 }).limit(50);

    const bills = await Bill.find({ customerId: customer._id })
      .sort({ createdAt: -1 }).limit(50);

    // Recalculate outstanding balance from transactions
    const balance = transactions.reduce((sum, t) =>
      t.type === 'gave' ? sum + t.amount : sum - t.amount, 0
    );

    res.json({ customer, transactions, bills, balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
};

// POST /api/customers — create new customer (admin/staff)
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, pin } = req.body;
    if (!name || !phone) return res.status(400).json({ message: 'Name and phone required' });
    const exists = await Customer.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });
    // Default PIN = last 4 digits of phone (customer can change later)
    const defaultPin = pin || phone.replace(/\D/g,'').slice(-4);
    const hashedPin = await bcrypt.hash(defaultPin, 10);
    const customer = await Customer.create({ name, phone, pin: hashedPin });
    res.status(201).json({ ...customer.toObject(), pin: undefined, defaultPin });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create customer' });
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, pin } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (pin) update.pin = await bcrypt.hash(pin, 10);
    const customer = await Customer.findByIdAndUpdate(req.params.id, update, { new: true }).select('-pin');
    if (!customer) return res.status(404).json({ message: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

// DELETE /api/customers/:id (soft delete)
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Customer removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete customer' });
  }
};

// POST /api/customers/register — self-registration with OTP already verified
exports.registerCustomer = async (req, res) => {
  try {
    const { name, phone, pin } = req.body;
    if (!name || !phone || !pin) return res.status(400).json({ message: 'All fields required' });
    const exists = await Customer.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });
    const hashedPin = await bcrypt.hash(pin, 10);
    const customer = await Customer.create({ name, phone, pin: hashedPin });
    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      token,
      customer: { ...customer.toObject(), pin: undefined }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

// POST /api/customers/login — customer login
exports.loginCustomer = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const customer = await Customer.findOne({ phone, isActive: true });
    if (!customer) return res.status(404).json({ message: 'Phone not registered' });
    const match = await bcrypt.compare(pin, customer.pin);
    if (!match) return res.status(401).json({ message: 'Wrong PIN' });
    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Get outstanding balance
    const transactions = await KhataTransaction.find({ customerId: customer._id });
    const balance = transactions.reduce((s, t) => t.type === 'gave' ? s + t.amount : s - t.amount, 0);

    res.json({
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
        totalSessions: customer.totalSessions,
        totalSpent: customer.totalSpent,
        outstandingBalance: balance,
        memberSince: customer.memberSince,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};
