const config = require("../config");

class RateLimiter {
  constructor() {
    this.lastHit = new Map();
    this.windowMs = config.rateLimit.windowMs;
  }

  isLimited(key) {
    const now = Date.now();
    const last = this.lastHit.get(key) || 0;

    if (now - last < this.windowMs) {
      return true;
    }

    this.lastHit.set(key, now);
    return false;
  }

  reset(key) {
    this.lastHit.delete(key);
  }

  clear() {
    this.lastHit.clear();
  }
}

module.exports = new RateLimiter();
