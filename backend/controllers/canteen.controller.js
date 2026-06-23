const CanteenItem = require('../models/CanteenItem');

exports.getItems = async (req, res) => {
  try {
    const items = await CanteenItem.find().sort({ order: 1, name: 1 });
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

exports.deleteItem = async (req, res) => {
  try {
    await CanteenItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
};
