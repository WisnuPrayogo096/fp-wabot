const Helpers = require("../utils/helpers");

class SessionHandler {
  constructor() {
    this.sessions = new Map();
  }

  set(chatId, step, payload = {}) {
    this.sessions.set(chatId, {
      step,
      payload,
      updatedAt: Helpers.nowISO(),
    });
  }

  get(chatId) {
    return (
      this.sessions.get(chatId) || {
        step: "idle",
        payload: {},
      }
    );
  }

  clear(chatId) {
    this.sessions.delete(chatId);
  }

  clearAll() {
    this.sessions.clear();
  }

  isInSession(chatId) {
    const session = this.get(chatId);
    return session.step !== "idle";
  }
}

module.exports = new SessionHandler();
