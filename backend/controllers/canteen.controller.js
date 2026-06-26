const CanteenItem = require('../models/CanteenItem');

exports.getItems = async (req, res) => {
  try {
    const items = await CanteenItem.find({ active: { $ne: false } }).sort({ order: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch canteen items' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await CanteenItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await CanteenItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item' });
  }
};

// DELETE — soft delete (active: false)
exports.deleteItem = async (req, res) => {
  try {
    await CanteenItem.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

// GET /api/canteen/deleted — soft-deleted items (admin only)
exports.getDeletedItems = async (req, res) => {
  try {
    const items = await CanteenItem.find({ active: false }).sort({ updatedAt: -1 }).limit(30);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deleted items' });
  }
};

// PUT /api/canteen/:id/restore (admin only)
exports.restoreItem = async (req, res) => {
  try {
    await CanteenItem.findByIdAndUpdate(req.params.id, { active: true });
    res.json({ message: 'Item restored' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore item' });
  }
};

// DELETE /api/canteen/:id/permanent (admin only)
exports.permanentDeleteItem = async (req, res) => {
  try {
    await CanteenItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to permanently delete item' });
  }
};
