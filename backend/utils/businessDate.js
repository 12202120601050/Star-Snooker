// Business day resets at 08:00. Before 8AM, it's still "yesterday's" business day.
function getBusinessDate(d = new Date()) {
  const t = new Date(d)
  if (t.getHours() < 8) t.setDate(t.getDate() - 1)
  return t.toISOString().split('T')[0]
}

// Returns { $gte: 8AM-today } for MongoDB createdAt queries.
function businessDayStart() {
  const now = new Date()
  const start = new Date(now)
  if (now.getHours() < 8) start.setDate(start.getDate() - 1)
  start.setHours(8, 0, 0, 0)
  return start
}

module.exports = { getBusinessDate, businessDayStart }
