const CommandHandler = require("./CommandHandler");
const ChatLockMiddleware = require("../middleware/ChatLockMiddleware");

class MessageHandler {
  async handle(message) {
    const chatId = message.from;
    const wa_id = message.from;
    const text = (message.body || "").trim();

    // Lock per chat untuk prevent double processing
    return ChatLockMiddleware.withLock(chatId, async () => {
      await CommandHandler.handle(message, wa_id, text);
    });
  }
}

module.exports = new MessageHandler();
