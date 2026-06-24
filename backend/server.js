const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS — tolerant of trailing slashes and any Vercel deploy/preview domain,
// so a small env-var typo doesn't block the site. API is JWT-protected.
const stripSlash = (s) => (s || '').trim().replace(/\/+$/, '');
const allowedOrigins = stripSlash(
  process.env.FRONTEND_URL ||
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3100'
)
  .split(',')
  .map(stripSlash)
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / mobile / same-origin
    const o = stripSlash(origin);
    if (allowedOrigins.includes(o) || /\.vercel\.app$/i.test(o) || /^http:\/\/localhost:\d+$/.test(o)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/bills',       require('./routes/bill.routes'));
app.use('/api/bookings',    require('./routes/booking.routes'));
app.use('/api/customers',   require('./routes/customer.routes'));
app.use('/api/khata',       require('./routes/khata.routes'));
app.use('/api/canteen',     require('./routes/canteen.routes'));
app.use('/api/sessions',    require('./routes/session.routes'));
app.use('/api/stock',       require('./routes/stock.routes'));
app.use('/api/stats',       require('./routes/stats.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/setup',       require('./routes/setup.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🎱 Star Snooker Academy API running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Star Snooker API on port ${PORT}`);
  console.log('📡 Routes: auth|bills|bookings|customers|khata|canteen|sessions|stock|stats|leaderboard');
});
