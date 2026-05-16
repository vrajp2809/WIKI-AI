import { connectDB, disconnectDB } from "./src/config/database";
import { env } from "./src/config/environment";
import { connectRedis } from "./src/config/redis";
import { OpenAIService } from "./src/services/ai/openai.service";
import { EmbeddingService } from "./src/services/rag/embedding.service";

async function testConnections() {
  try {
    console.log("Testing MongoDB connection...");
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    console.log("Testing Redis connection...");
    const redisConnected = await connectRedis();
    if (redisConnected) {
      console.log("✅ Redis connected successfully");
    } else {
      console.log("⚠️  Redis unavailable, continuing without it");
    }

    console.log("Testing HuggingFace embeddings...");
    const embeddingService = new EmbeddingService();
    const testEmbedding = await embeddingService.embed("Hello world");
    console.log(
      `✅ HuggingFace embeddings working (dimension: ${testEmbedding.length})`,
    );

    if (env.OPENAI_API_KEY || env.GROQ_API_KEY) {
      console.log("Testing OpenAI connection...");
      const openai = new OpenAIService();
      const testResponse = await openai.complete(
        "You are a helpful assistant.",
        [{ role: "user", content: "Say hello" }],
      );
      console.log("✅ OpenAI connected successfully");
    } else {
      console.log("⚠️  OpenAI API key not provided, skipping OpenAI test");
    }

    console.log("🎉 All services are available!");
  } catch (err) {
    console.error("❌ Connection test failed:", err);
  } finally {
    await disconnectDB();
  }
}

testConnections();
