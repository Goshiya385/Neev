const mongoose = require('mongoose');

let connected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  // If placeholder URI, run in demo mode
  if (!uri || uri.includes('your_user') || uri.includes('xxxxx')) {
    console.log('');
    console.log('⚡ ═══════════════════════════════════════════════════');
    console.log('⚡  NEEV Running in DEMO MODE (no database)');
    console.log('⚡  All API routes will return mock/demo data');
    console.log('⚡  Set MONGODB_URI in .env for real database');
    console.log('⚡ ═══════════════════════════════════════════════════');
    console.log('');
    connected = false;
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    connected = true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚡ Falling back to DEMO MODE');
    connected = false;
  }
};

const isConnected = () => connected;

module.exports = connectDB;
module.exports.isConnected = isConnected;
