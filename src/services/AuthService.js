const Cache = require("../utils/cache");
const SessionRepository = require("../database/repositories/SessionRepository");
const ApiService = require("./ApiService");
const LogRepository = require("../database/repositories/LogRepository");

class AuthService {
  constructor() {
    this.cache = new Cache();
  }

  async getAuth(wa_id) {
    // Cek cache dulu
    const cached = this.cache.get(wa_id);
    if (cached?.token) return cached;

    // Load dari DB
    const row = await SessionRepository.findByWaId(wa_id);
    if (!row?.token) return null;

    const data = {
      token: row.token,
      id_finger: row.id_finger,
      full_name: row.full_name,
      no_telp: row.no_telp,
      phone: row.phone,
    };

    this.cache.set(wa_id, data);
    return data;
  }

  async saveAuth(wa_id, payload) {
    this.cache.set(wa_id, payload);
    await SessionRepository.save(wa_id, payload);
  }

  async clearAuth(wa_id) {
    this.cache.delete(wa_id);
    await SessionRepository.delete(wa_id);
  }

  async login(wa_id, phone) {
    const resp = await ApiService.request({
      wa_id,
      command: "/login",
      method: "post",
      path: "/api/login-number",
      data: { no_telp: phone },
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/login",
      endpoint: "/api/login-number",
      http_method: "POST",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }

  async logout(wa_id, token) {
    const resp = await ApiService.request({
      wa_id,
      command: "/logout",
      method: "post",
      path: "/api/logout",
      token,
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/logout",
      endpoint: "/api/logout",
      http_method: "POST",
      response_code: resp.code,
      response_message: resp.message,
    });

    await this.clearAuth(wa_id);
    return resp;
  }

  sweepCache() {
    return this.cache.sweep();
  }
}

module.exports = new AuthService();
