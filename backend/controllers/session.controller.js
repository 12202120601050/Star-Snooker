const ActiveSession = require('../models/ActiveSession');

// Whitelist of writable fields (prevents NoSQL-operator injection / mass-assignment).
const FIELDS = [
  'tableName', 'mode', 'status', 'startTime', 'pausedAt', 'totalPausedMs',
  'hourRate', 'frameCharge', 'players', 'framesWonBy', 'customerName',
  'customerId', 'cart', 'note',
];

function pick(body) {
  const out = {};
  for (const k of FIELDS) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

// GET /api/sessions — all live tables
exports.getSessions = async (req, res) => {
  try {
    res.json(await ActiveSession.find());
  } catch {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
};

// GET /api/sessions/my — a customer's own running table (matched by name)
exports.getMySession = async (req, res) => {
  try {
    const session = await ActiveSession.findOne({ customerName: req.user.name });
    res.json(session || null);
  } catch {
    res.status(500).json({ message: 'Failed to fetch session' });
  }
};

// POST /api/sessions — start / update a table session (upsert by tableId)
exports.saveSession = async (req, res) => {
  try {
    const { tableId } = req.body;
    if (!tableId) return res.status(400).json({ message: 'tableId is required' });
    const session = await ActiveSession.findOneAndUpdate(
      { tableId },
      { tableId, ...pick(req.body) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json(session);
  } catch {
    res.status(500).json({ message: 'Failed to save session' });
  }
};

// PATCH /api/sessions/:tableId — update live state (pause, cart, etc.)
exports.updateSession = async (req, res) => {
  try {
    const session = await ActiveSession.findOneAndUpdate(
      { tableId: req.params.tableId },
      { $set: pick(req.body) },
      { new: true },
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch {
    res.status(500).json({ message: 'Failed to update session' });
  }
};

// PATCH /api/sessions/:tableId/frame — record a frame result (loser pays).
// body: { winner: 0 | 1 } (index into players)
exports.addFrame = async (req, res) => {
  try {
    const winner = Number(req.body.winner);
    if (![0, 1].includes(winner)) return res.status(400).json({ message: 'winner must be 0 or 1' });
    const session = await ActiveSession.findOneAndUpdate(
      { tableId: req.params.tableId },
      { $push: { framesWonBy: winner } },
      { new: true },
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch {
    res.status(500).json({ message: 'Failed to record frame' });
  }
};

// DELETE /api/sessions/:tableId — end (after checkout / cancel)
exports.deleteSession = async (req, res) => {
  try {
    await ActiveSession.findOneAndDelete({ tableId: req.params.tableId });
    res.json({ message: 'Session ended' });
  } catch {
    res.status(500).json({ message: 'Failed to delete session' });
  }
};
