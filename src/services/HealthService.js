// src/services/HealthService.js
class HealthService {
  async checkHealth() {
    const health = {
      status: "ok",
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: await this._checkDatabase(),
      whatsapp: await this._checkWhatsApp(),
    };
    return health;
  }

  async _checkDatabase() {
    try {
      await dbConnection.getPool().query("SELECT 1");
      return { status: "connected" };
    } catch (e) {
      return { status: "disconnected", error: e.message };
    }
  }
}

module.exports = new HealthService();