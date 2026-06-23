// scripts/set-customer-pin.js
// Usage: node scripts/set-customer-pin.js <phone> <pin>
// Example: node scripts/set-customer-pin.js 9904039420 9420

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Customer = require('../models/Customer');

const [,, phone, pin] = process.argv;

if (!phone || !pin) {
  console.log('Usage: node scripts/set-customer-pin.js <phone> <pin>');
  console.log('Example: node scripts/set-customer-pin.js 9904039420 9420');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashed = await bcrypt.hash(pin, 10);
  const customer = await Customer.findOneAndUpdate(
    { phone },
    { pin: hashed },
    { new: true }
  );
  if (customer) {
    console.log(`✅ PIN set for: ${customer.name} (${customer.phone})`);
    console.log(`   They can now login with PIN: ${pin}`);
  } else {
    console.log(`❌ Customer with phone ${phone} not found`);
  }
  process.exit(0);
};

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
