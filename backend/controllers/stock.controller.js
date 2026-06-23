const StockCount = require('../models/StockCount');
const CanteenItem = require('../models/CanteenItem');

// GET /api/stock — recent shift counts
exports.getCounts = async (req, res) => {
  try {
    const counts = await StockCount.find().sort({ createdAt: -1 }).limit(50);
    res.json(counts);
  } catch {
    res.status(500).json({ message: 'Failed to fetch stock counts' });
  }
};

// POST /api/stock — record a shift stock count; sets system stock = counted.
// body: { shift, rows: [{ itemId, name, system, counted }] }
exports.createCount = async (req, res) => {
  try {
    const { shift, rows } = req.body;
    if (!Array.isArray(rows)) return res.status(400).json({ message: 'rows array required' });

    const count = await StockCount.create({
      shift: typeof shift === 'string' ? shift : 'Evening',
      rows: rows.map((r) => ({
        itemId: String(r.itemId || ''),
        name: String(r.name || ''),
        system: Number(r.system) || 0,
        counted: Number(r.counted) || 0,
      })),
      countedBy: req.user._id,
    });

    // Reconcile system stock to the physically counted figures.
    await Promise.all(
      count.rows
        .filter((r) => r.itemId)
        .map((r) => CanteenItem.findByIdAndUpdate(r.itemId, { stock: r.counted })),
    );

    res.status(201).json(count);
  } catch {
    res.status(500).json({ message: 'Failed to save stock count' });
  }
};
