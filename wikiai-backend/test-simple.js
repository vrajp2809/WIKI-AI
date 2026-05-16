const mongoose = require("mongoose");
const Redis = require("ioredis");

async function testConnections() {
  try {
    console.log("Testing MongoDB connection...");
    await mongoose.connect("mongodb://localhost:27017/wikiai_db");
    console.log("✅ MongoDB connected successfully");
    await mongoose.disconnect();

    console.log("Testing Redis connection...");
    const redis = new Redis("redis://localhost:6379");
    await redis.ping();
    console.log("✅ Redis connected successfully");
    await redis.disconnect();

    console.log("🎉 MongoDB and Redis are available!");
  } catch (err) {
    console.error("❌ Connection test failed:", err.message);
  }
}

testConnections();
