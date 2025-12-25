const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const fs = require("fs");
const config = require("../config");
const MessageHandler = require("../handlers/MessageHandler");

class WhatsAppBot {
  constructor() {
    this.client = null;
    this.messageHandler = MessageHandler;
    this.isInitializing = false;
    this.isReady = false;
  }

  initialize() {
    // Prevent multiple initialization
    if (this.isInitializing) {
      console.log("⏳ Bot is already initializing, please wait...");
      return this.client;
    }

    if (this.isReady && this.client) {
      console.log("✅ Bot is already ready!");
      return this.client;
    }

    try {
      this.isInitializing = true;
      this.isReady = false;

      // Destroy existing client if any
      if (this.client) {
        this.client.removeAllListeners();
        this.client = null;
      }

      // Use absolute path for session storage to ensure consistency
      // Even if working directory changes, session will be in the same place
      const projectRoot = path.resolve(__dirname, "../..");
      const authPath = path.join(projectRoot, ".wwebjs_auth");

      // Ensure auth directory exists
      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
        console.log(`📁 Created auth directory: ${authPath}`);
      }

      console.log(`💾 Using auth path: ${authPath}`);

      // Create client with LocalAuth - using explicit path for consistency
      // This ensures session persists even if script is run from different directory
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: authPath,
        }),
        puppeteer: config.whatsapp.puppeteer,
      });

      this._setupEventListeners();
      this.client.initialize().catch((error) => {
        console.error("❌ Failed to initialize WhatsApp client:", error);
        this.isInitializing = false;
      });

      return this.client;
    } catch (error) {
      console.error("❌ Error creating WhatsApp client:", error);
      this.isInitializing = false;
      throw error;
    }
  }

  _setupEventListeners() {
    this.client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log("📱 Scan QR di WhatsApp untuk login.");
    });

    this.client.on("ready", () => {
      console.log("✅ Bot WhatsApp ready!");
      console.log("📱 Bot is now listening for messages...");
      this.isReady = true;
      this.isInitializing = false;
    });

    this.client.on("loading_screen", (percent, message) => {
      console.log(`⏳ Loading: ${percent}% - ${message}`);
    });

    this.client.on("authenticated", () => {
      console.log("✅ Authentication successful!");
    });

    this.client.on("auth_failure", (msg) => {
      console.error("❌ Authentication failed:", msg);
      this.isReady = false;
      this.isInitializing = false;
    });

    this.client.on("remote_session_saved", () => {
      console.log("💾 Remote session saved successfully");
    });

    this.client.on("change_state", (state) => {
      console.log(`🔄 Client state changed: ${state}`);
    });

    this.client.on("error", (error) => {
      console.error("❌ WhatsApp Client Error:", error);
    });

    this.client.on("message", async (message) => {
      // Only process messages when bot is ready
      if (!this.isReady) {
        console.log(
          "⚠️  Received message but bot is not ready yet, ignoring..."
        );
        return;
      }

      // Log incoming message for debugging
      const from = message.from;
      const body = (message.body || "").trim().substring(0, 50);
      console.log(
        `📨 Message from ${from}: ${body}${body.length >= 50 ? "..." : ""}`
      );

      try {
        await this.messageHandler.handle(message);
      } catch (error) {
        console.error("❌ Error handling message:", error);
        console.error("Error stack:", error.stack);
      }
    });

    this.client.on("disconnected", (reason) => {
      console.log(`❌ Bot disconnected: ${reason}`);
      this.isReady = false;
      this.isInitializing = false;

      // Only reconnect for certain disconnect reasons
      if (reason === "NAVIGATION" || reason === "CONFLICT") {
        console.log(
          `🔄 Attempting to reconnect in 5 seconds... (reason: ${reason})`
        );
        setTimeout(() => {
          if (!this.isReady && !this.isInitializing) {
            this.initialize();
          }
        }, 5000);
      } else {
        console.log(
          `⚠️  Disconnected with reason: ${reason}. Manual restart may be required.`
        );
      }
    });
  }

  async destroy() {
    if (this.client) {
      console.log("💾 Closing client (session will be preserved)...");
      this.client.removeAllListeners();
      // Don't call logout() - it will delete the session
      // LocalAuth automatically saves session to disk
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.isInitializing = false;
      console.log("✅ Client destroyed (session preserved in .wwebjs_auth)");
    }
  }

  getClient() {
    return this.client;
  }
}

module.exports = new WhatsAppBot();
