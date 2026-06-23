const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3100',
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
