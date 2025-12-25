class ChatLockMiddleware {
  constructor() {
    this.locks = new Map();
  }

  async withLock(chatId, fn) {
    const prev = this.locks.get(chatId) || Promise.resolve();

    const next = prev
      .catch(() => {}) // Jangan putus chain
      .then(() => fn())
      .finally(() => {
        // Bersihkan lock bila chain ini yang terakhir
        if (this.locks.get(chatId) === next) {
          this.locks.delete(chatId);
        }
      });

    this.locks.set(chatId, next);
    return next;
  }

  clear(chatId) {
    this.locks.delete(chatId);
  }

  clearAll() {
    this.locks.clear();
  }
}

module.exports = new ChatLockMiddleware();
