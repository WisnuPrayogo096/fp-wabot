// src/utils/metrics.js
class Metrics {
  constructor() {
    this.counters = new Map();
    this.timers = new Map();
  }

  incrementCounter(name) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + 1);
  }

  recordTime(name, duration) {
    const times = this.timers.get(name) || [];
    times.push(duration);
    this.timers.set(name, times);
  }

  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      timers: Object.fromEntries(this.timers),
    };
  }
}

module.exports = new Metrics();
