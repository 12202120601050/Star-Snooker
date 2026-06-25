const Bill = require('../models/Bill');
const Customer = require('../models/Customer');
const CanteenItem = require('../models/CanteenItem');
const KhataTransaction = require('../models/KhataTransaction');

// POST /api/bills — create a bill (checkout). Decrements canteen stock for any
// items sold, updates customer loyalty/credit when a customer is attached.
exports.createBill = async (req, res) => {
  try {
    const { customerName, customerId, paymentMethod, total, canteenItems, ...rest } = req.body;

    const bill = await Bill.create({
      ...rest,
      customerName: customerName || 'Walk-in',
      customerId: customerId || null,
      paymentMethod,
      total,
      canteenItems: canteenItems || [],
      createdBy: req.user._id,
    });

    // Reduce stock for each canteen item sold.
    if (Array.isArray(canteenItems)) {
      await Promise.all(
        canteenItems
          .filter((i) => i.itemId)
          .map((i) => CanteenItem.findByIdAndUpdate(i.itemId, { $inc: { stock: -(i.qty || 1) } })),
      );
    }

    // Customer loyalty / credit.
    if (customerId) {
      if (paymentMethod === 'credit') {
        await KhataTransaction.create({
          customerId, customerName, type: 'gave', amount: total,
          note: rest.tableName || 'Table', linkedBillId: bill._id, createdBy: req.user._id,
        });
        await Customer.findByIdAndUpdate(customerId, { $inc: { outstandingBalance: total, totalSessions: 1 } });
      } else {
        const pts = Math.max(1, Math.floor((rest.duration || 0) / 60));
        await Customer.findByIdAndUpdate(customerId, { $inc: { totalSessions: 1, totalSpent: total, loyaltyPoints: pts } });
      }
    }

    res.status(201).json(bill);
  } catch (err) {
    console.error('Bill error:', err.message);
    res.status(500).json({ message: 'Failed to create bill' });
  }
};

// GET /api/bills — list with filters
exports.getBills = async (req, res) => {
  try {
    const { date, from, to, payment, table, customer, limit = 100 } = req.query;
    const query = {};
    if (date) query.date = date;
    else if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }
    if (payment && payment !== 'all') query.paymentMethod = payment;
    if (table && table !== 'all') query.tableName = table;
    if (customer && customer !== 'all') {
      query.customerName = customer === 'walkin' ? 'Walk-in' : customer;
    }
    const bills = await Bill.find(query).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 100, 500));
    res.json(bills);
  } catch {
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
};

// PUT /api/bills/:id
exports.updateBill = async (req, res) => {
  try {
    const allowed = ['tableName', 'amount', 'canteenAmount', 'discount', 'total', 'paymentMethod', 'cashAmount', 'upiAmount', 'note', 'customerName'];
    const update = {};
    for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
    const bill = await Bill.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update bill' });
  }
};

// DELETE /api/bills/:id
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete bill' });
  }
};

// GET /api/bills/today
exports.getTodayBills = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    res.json(await Bill.find({ date: today }).sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: 'Failed to fetch today bills' });
  }
};
