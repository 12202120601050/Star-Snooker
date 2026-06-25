/**
 * Full database reset — deletes all transactional data.
 * Keeps: Users (staff/admin accounts)
 * Deletes: Bills, ActiveSessions, Customers, KhataTransactions, CanteenItems, StockCounts, Bookings
 *
 * Run from the backend folder:
 *   node scripts/resetDb.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

dotenv.config({ path: path.join(__dirname, '../.env') });

const COLLECTIONS = [
  'bills',
  'activesessions',
  'customers',
  'khatatransactions',
  'canteenItems',   // will also try lowercase
  'canteentransactions',
  'stockcounts',
  'bookings',
  'leaderboards',
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const reset = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('\n✅ Connected to MongoDB Atlas\n');

  // List what will be deleted
  const db = mongoose.connection.db;
  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  const toDelete = existing.filter((name) =>
    COLLECTIONS.some((c) => c.toLowerCase() === name.toLowerCase())
  );

  if (toDelete.length === 0) {
    console.log('ℹ️  No matching collections found — nothing to delete.\n');
    process.exit(0);
  }

  console.log('🗑️  The following collections will be COMPLETELY CLEARED:');
  toDelete.forEach((name) => console.log(`   • ${name}`));
  console.log('\n⚠️  Staff / admin accounts will NOT be touched.\n');

  const confirm = await ask('Type "yes" to confirm reset: ');
  if (confirm.trim().toLowerCase() !== 'yes') {
    console.log('\n❌ Cancelled — nothing was deleted.\n');
    process.exit(0);
  }

  console.log('\nDeleting…');
  for (const name of toDelete) {
    const result = await db.collection(name).deleteMany({});
    console.log(`   ✅ ${name}: ${result.deletedCount} documents deleted`);
  }

  console.log('\n🎉 Database reset complete. Run "node scripts/seed.js" if you need to re-seed canteen items.\n');
  process.exit(0);
};

reset().catch((err) => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});
