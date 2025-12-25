require("dotenv").config();
const config = require("./src/config");
const dbConnection = require("./src/database/connection");
const WhatsAppBot = require("./src/bot/WhatsAppBot");
const AuthService = require("./src/services/AuthService");

let botReady = false;

async function bootstrap() {
  try {
    dbConnection.initialize();
    console.log("✅ Database connection pool initialized");

    // 2. Start cache sweeper
    const cacheSweepTimer = setInterval(() => {
      const removed = AuthService.sweepCache();
      if (removed > 0) {
        console.log(`🧹 Cache sweep: removed ${removed} expired entries`);
      }
    }, config.cache.sweepMs);
    cacheSweepTimer.unref?.();

    // 3. Initialize WhatsApp Bot
    try {
      console.log("🚀 Initializing WhatsApp Bot...");
      const client = WhatsAppBot.initialize();

      // Wait for bot to be ready or timeout after 2 minutes
      await waitForBotReady(client, 120000);
      botReady = true;
      console.log("✅ WhatsApp Bot is ready and session is persisted");
    } catch (error) {
      console.error("❌ Failed to initialize WhatsApp Bot:", error);
      throw error;
    }

    // 4. Setup graceful shutdown
    setupGracefulShutdown(cacheSweepTimer);
  } catch (error) {
    console.error("❌ Bootstrap failed:", error);
    process.exit(1);
  }
}

async function waitForBotReady(client, timeout) {
  return new Promise((resolve, reject) => {
    const readyTimeout = setTimeout(() => {
      reject(new Error("Bot initialization timeout"));
    }, timeout);

    const readyHandler = () => {
      clearTimeout(readyTimeout);
      client.removeListener("ready", readyHandler);
      resolve();
    };

    // If already ready, resolve immediately
    if (client && client.info) {
      clearTimeout(readyTimeout);
      resolve();
      return;
    }

    client.on("ready", readyHandler);
  });
}

function setupGracefulShutdown(cacheSweepTimer) {
  const shutdown = async (signal) => {
    console.log(`\n🛑 [shutdown] ${signal} received...`);

    try {
      // Stop cache sweeper first
      clearInterval(cacheSweepTimer);
      console.log("✅ Cache sweeper stopped");
    } catch (e) {
      console.error("⚠️  Cache sweeper cleanup failed:", e.message);
    }

    try {
      // Give bot time to save session before destroying
      if (botReady) {
        console.log("💾 Waiting for WhatsApp session to be saved...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Destroy WhatsApp client (session is auto-saved by LocalAuth)
      await WhatsAppBot.destroy();
      console.log(
        "✅ WhatsApp client destroyed (session preserved in .wwebjs_auth)"
      );
    } catch (e) {
      console.error("⚠️  WhatsApp client cleanup failed:", e.message);
    }

    try {
      // Close database connection
      await dbConnection.close();
      console.log("✅ Database connection closed");
    } catch (e) {
      console.error("⚠️  Database cleanup failed:", e.message);
    }

    console.log("👋 Shutdown complete - session is ready for next restart");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    shutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    shutdown("UNHANDLED_REJECTION");
  });
}

console.log("🚀 Starting WhatsApp Bot...");
console.log(`📍 Base URL: ${config.app.baseUrl}`);
console.log(`💾 Database: ${config.database.host}:${config.database.port}`);
console.log(`⏱️  Cache TTL: ${config.cache.ttlMs / 1000}s`);

bootstrap();
