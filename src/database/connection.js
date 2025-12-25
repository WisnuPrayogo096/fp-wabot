const mysql = require("mysql2/promise");
const config = require("../config");

class DatabaseConnection {
  constructor() {
    this.pool = null;
  }

  initialize() {
    if (this.pool) return this.pool;

    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: config.database.connectionLimit,
      queueLimit: 0,
      timezone: config.database.timezone,
    });

    return this.pool;
  }

  getPool() {
    if (!this.pool) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

module.exports = new DatabaseConnection();
