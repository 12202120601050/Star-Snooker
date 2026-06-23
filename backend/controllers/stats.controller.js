const Bill = require('../models/Bill');

exports.getStats = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    const now = new Date();
    let from;
    if (period === 'today') {
      from = new Date(now.toISOString().split('T')[0]);
    } else if (period === '7days') {
      from = new Date(now - 7 * 24 * 3600000);
    } else if (period === '30days') {
      from = new Date(now - 30 * 24 * 3600000);
    } else if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'lastmonth') {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      const bills = await Bill.find({ createdAt: { $gte: from, $lt: to }, paymentMethod: { $ne: 'credit' } });
      return res.json(buildStats(bills));
    }
    const bills = await Bill.find({ createdAt: { $gte: from }, paymentMethod: { $ne: 'credit' } });
    res.json(buildStats(bills));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

function buildStats(bills) {
  const revenue = bills.reduce((s, b) => s + b.total, 0);
  const cash = bills.filter(b => b.paymentMethod === 'cash').reduce((s, b) => s + b.total, 0);
  const upi  = bills.filter(b => b.paymentMethod === 'upi').reduce((s, b) => s + b.total, 0);
  const avg  = bills.length ? Math.round(revenue / bills.length) : 0;

  // Top stations
  const stationMap = {};
  bills.forEach(b => {
    if (!stationMap[b.stationName]) stationMap[b.stationName] = { revenue: 0, count: 0 };
    stationMap[b.stationName].revenue += b.total;
    stationMap[b.stationName].count += 1;
  });
  const topStations = Object.entries(stationMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return { revenue, cash, upi, avg, count: bills.length, topStations };
}
