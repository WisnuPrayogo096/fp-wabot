const ApiService = require("./ApiService");
const LogRepository = require("../database/repositories/LogRepository");

class PresensiService {
  async getMesinList(wa_id, token) {
    const resp = await ApiService.request({
      wa_id,
      command: "/mesin",
      method: "get",
      path: "/api/mesin-presensi",
      token,
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/mesin",
      endpoint: "/api/mesin-presensi",
      http_method: "GET",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }

  async createPresensi(wa_id, token, mesinId, status) {
    const resp = await ApiService.request({
      wa_id,
      command: status === 0 ? "/in" : "/out",
      method: "post",
      path: "/api/fp-presensi/create",
      token,
      data: { id_fp_finger_mesin: mesinId, status },
    });

    await LogRepository.logRequest({
      wa_id,
      command: status === 0 ? "/in" : "/out",
      endpoint: "/api/fp-presensi/create",
      http_method: "POST",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }

  async getTodayPresensi(wa_id, token) {
    const resp = await ApiService.request({
      wa_id,
      command: "/fp-today",
      method: "get",
      path: "/api/today-presensi",
      token,
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/fp-today",
      endpoint: "/api/today-presensi",
      http_method: "GET",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }
}

module.exports = new PresensiService();
