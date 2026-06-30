const Expense = require('../models/Expense');
const { getBusinessDate } = require('../utils/businessDate');

// POST /api/expenses  body: { amount, note, type: 'out'|'in' }
exports.createExpense = async (req, res) => {
  try {
    const { amount, note, type } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Amount must be positive' });
    const expense = await Expense.create({
      amount: Number(amount),
      note: note || '',
      type: type === 'in' ? 'in' : 'out',
      createdBy: req.user._id,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record expense' });
  }
};

// GET /api/expenses?date=YYYY-MM-DD (defaults to current business date)
exports.getExpenses = async (req, res) => {
  try {
    const date = req.query.date || getBusinessDate();
    const expenses = await Expense.find({ date }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

// DELETE /api/expenses/:id — admin only
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};
