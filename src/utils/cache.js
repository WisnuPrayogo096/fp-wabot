const config = require("../config");

class Cache {
  constructor(ttlMs) {
    this.store = new Map();
    this.ttlMs = ttlMs || config.cache.ttlMs;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      cachedAt: Date.now(),
    });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.cachedAt > this.ttlMs) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  sweep() {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.store.entries()) {
      if (now - item.cachedAt > this.ttlMs) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }

  size() {
    return this.store.size;
  }
}

module.exports = Cache;