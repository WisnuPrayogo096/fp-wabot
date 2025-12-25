// src/utils/events.js
const EventEmitter = require("events");

class BotEvents extends EventEmitter {
  emitLogin(wa_id, data) {
    this.emit("user:login", { wa_id, ...data });
  }

  emitPresensi(wa_id, data) {
    this.emit("presensi:created", { wa_id, ...data });
  }

  emitError(error) {
    this.emit("error", error);
  }
}

module.exports = new BotEvents();

// Usage:
botEvents.on("user:login", (data) => {
  logger.info("User logged in", data);
  // Send notification to admin, etc
});
