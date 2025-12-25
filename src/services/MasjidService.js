const ApiService = require("./ApiService");
const LogRepository = require("../database/repositories/LogRepository");

class MasjidService {
  async getMesinList(wa_id, token) {
    const resp = await ApiService.request({
      wa_id,
      command: "/pray",
      method: "get",
      path: "/api/mesin-masjid",
      token,
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/pray",
      endpoint: "/api/mesin-masjid",
      http_method: "GET",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }

  async getJadwalSholat(wa_id, token) {
    const resp = await ApiService.request({
      wa_id,
      command: "/pray",
      method: "get",
      path: "/api/jadwal-sholat",
      token,
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/pray",
      endpoint: "/api/jadwal-sholat",
      http_method: "GET",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }

  async createAbsenMasjid(wa_id, token, mesinId) {
    const resp = await ApiService.request({
      wa_id,
      command: "/pray",
      method: "post",
      path: "/api/fp-masjid/create",
      token,
      data: { id_binroh_mesin_finger: mesinId },
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/pray",
      endpoint: "/api/fp-masjid/create",
      http_method: "POST",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }
}

module.exports = new MasjidService();
