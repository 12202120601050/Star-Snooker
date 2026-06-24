const mongoose = require('mongoose');

const connectDB = async (retries = 5, delayMs = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${i}/${retries}: ${err.message}`);
      if (i < retries) {
        console.log(`   Retrying in ${delayMs / 1000}s…`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  console.error('💀 MongoDB unreachable — API routes will fail. Fix Atlas IP whitelist or resume cluster.');
  // Don't exit: let the server stay up so health-check responds and Railway doesn't restart loop
};

module.exports = connectDB;
