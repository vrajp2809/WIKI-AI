// Simple test to check if environment import works
try {
  const { env } = require("./src/config/environment");
  console.log("✅ Environment import successful");
  console.log("NODE_ENV:", env.NODE_ENV);
  console.log("PORT:", env.PORT);
  console.log("MONGODB_URI:", env.MONGODB_URI);
  console.log("REDIS_URL:", env.REDIS_URL);
} catch (error) {
  console.error("❌ Environment import failed:", error.message);
}
