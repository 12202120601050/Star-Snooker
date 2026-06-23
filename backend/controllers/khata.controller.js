const KhataTransaction = require('../models/KhataTransaction');
const Customer = require('../models/Customer');

// GET /api/khata/:customerId
exports.getTransactions = async (req, res) => {
  try {
    const txns = await KhataTransaction.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 });
    const balance = txns.reduce((s, t) => t.type === 'gave' ? s + t.amount : s - t.amount, 0);
    res.json({ transactions: txns, balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// POST /api/khata/:customerId — add transaction
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const txn = await KhataTransaction.create({
      customerId: customer._id,
      customerName: customer.name,
      type, amount, note,
      createdBy: req.user._id,
    });

    // Update outstanding balance
    const delta = type === 'gave' ? amount : -amount;
    await Customer.findByIdAndUpdate(customer._id, { $inc: { outstandingBalance: delta } });

    // WhatsApp notification for payment received
    try {
      if (type === 'got' && customer.phone) {
        const wa = require('../services/whatsapp.service');
        const newBal = Math.max(0, (customer.outstandingBalance || 0) - amount);
        wa.sendMessage(customer.phone, wa.paymentMessage({ customerName: customer.name, amount, balance: newBal }));
      }
    } catch {}

    res.status(201).json(txn);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add transaction' });
  }
};

// GET /api/khata — all customers with balances
exports.getAllBalances = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true }).select('-pin').sort({ name: 1 });
    const results = await Promise.all(customers.map(async c => {
      const txns = await KhataTransaction.find({ customerId: c._id });
      const balance = txns.reduce((s, t) => t.type === 'gave' ? s + t.amount : s - t.amount, 0);
      return { ...c.toObject(), balance };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch balances' });
  }
};
