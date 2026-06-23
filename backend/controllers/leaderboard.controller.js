const Customer = require('../models/Customer');

// Derive a loyalty tier from points (1 point ≈ 1 hour played).
function tierFor(points) {
  if (points >= 300) return 'Legend';
  if (points >= 200) return 'Master';
  if (points >= 100) return 'Diamond';
  if (points >= 50) return 'Gold';
  return 'Rookie';
}

// Privacy: never expose a full name publicly. Show first name + last initial.
function maskName(name) {
  if (!name) return 'Player';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

// GET /api/leaderboard — PUBLIC. Top players by loyalty points.
// Returns only display-safe fields (no phone, id, balance, or spend).
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 25);
    const customers = await Customer.find({ isActive: true })
      .sort({ loyaltyPoints: -1 })
      .limit(limit)
      .select('name loyaltyPoints')
      .lean();

    const leaderboard = customers.map((c, i) => ({
      rank: i + 1,
      name: maskName(c.name),
      points: c.loyaltyPoints || 0,
      tier: tierFor(c.loyaltyPoints || 0),
    }));

    // Cache at the edge for a minute — this is non-sensitive, slow-moving data.
    res.set('Cache-Control', 'public, max-age=60');
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};
