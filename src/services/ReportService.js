const ApiService = require("./ApiService");
const LogRepository = require("../database/repositories/LogRepository");

class ReportService {
  async getPresensiReport(wa_id, token, bulan, tahun, page = 1) {
    const resp = await ApiService.request({
      wa_id,
      command: "/fp-rep",
      method: "get",
      path: "/api/fp-absensi",
      token,
      params: { bulan, tahun, page },
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/fp-rep",
      endpoint: "/api/fp-absensi",
      http_method: "GET",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }

  async getMasjidReport(wa_id, token, bulan, tahun, page = 1) {
    const resp = await ApiService.request({
      wa_id,
      command: "/fp-pray",
      method: "get",
      path: "/api/fp-masjid",
      token,
      params: { bulan, tahun, page },
    });

    await LogRepository.logRequest({
      wa_id,
      command: "/fp-pray",
      endpoint: "/api/fp-masjid",
      http_method: "GET",
      response_code: resp.code,
      response_message: resp.message,
    });

    return resp;
  }
}

module.exports = new ReportService();
