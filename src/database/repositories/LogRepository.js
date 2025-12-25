const dbConnection = require("../connection");

class LogRepository {
  async logRequest({
    wa_id,
    command,
    endpoint,
    http_method,
    response_code,
    response_message,
  }) {
    try {
      const pool = dbConnection.getPool();
      await pool.query(
        `INSERT INTO wa_request_logs (wa_id, command, endpoint, http_method, response_code, response_message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          wa_id,
          command || "-",
          endpoint || null,
          http_method || null,
          Number.isFinite(response_code) ? response_code : null,
          response_message ? String(response_message).slice(0, 255) : null,
        ]
      );
    } catch (e) {
      // Silent fail untuk logging
      console.error("[LogRepository] Failed to log:", e.message);
    }
  }
}

module.exports = new LogRepository();
