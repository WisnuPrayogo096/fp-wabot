const dbConnection = require("../connection");

class SessionRepository {
  async findByWaId(wa_id) {
    const pool = dbConnection.getPool();
    const [rows] = await pool.query(
      `SELECT wa_id, phone, token, id_finger, full_name, no_telp, 
              last_login_at, updated_at
       FROM wa_sessions
       WHERE wa_id = ?
       LIMIT 1`,
      [wa_id]
    );
    return rows[0] || null;
  }

  async save(wa_id, data) {
    const pool = dbConnection.getPool();
    const {
      phone,
      token,
      id_finger = null,
      full_name = null,
      no_telp = null,
    } = data;

    await pool.query(
      `INSERT INTO wa_sessions (wa_id, phone, token, id_finger, full_name, no_telp, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         phone = VALUES(phone),
         token = VALUES(token),
         id_finger = VALUES(id_finger),
         full_name = VALUES(full_name),
         no_telp = VALUES(no_telp),
         last_login_at = NOW(),
         updated_at = NOW()`,
      [wa_id, phone, token, id_finger, full_name, no_telp]
    );
  }

  async delete(wa_id) {
    const pool = dbConnection.getPool();
    await pool.query(`DELETE FROM wa_sessions WHERE wa_id = ?`, [wa_id]);
  }
}

module.exports = new SessionRepository();
