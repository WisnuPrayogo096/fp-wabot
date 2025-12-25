const axios = require("axios");
const config = require("../config");
const Helpers = require("../utils/helpers");
const LogRepository = require("../database/repositories/LogRepository");

class ApiService {
  constructor() {
    this.baseUrl = config.app.baseUrl;
    this.timeout = config.http.timeoutMs;
    this.maxRetry = config.http.maxRetry;
    this.retryDelay = config.http.retryDelayMs;
  }

  async request({ wa_id, command, method, path, token, data, params }) {
    const url = `${this.baseUrl}${path}`;

    for (let attempt = 0; attempt <= this.maxRetry; attempt++) {
      try {
        const res = await axios({
          method,
          url,
          data,
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: this.timeout,
        });

        return res.data;
      } catch (err) {
        const hasBody = !!err.response?.data;

        if (!hasBody) {
          await LogRepository.logRequest({
            wa_id,
            command,
            endpoint: path,
            http_method: String(method).toUpperCase(),
            response_code: 0,
            response_message: Helpers.axiosErrorToLog(err),
          });
        } else {
          return err.response.data;
        }

        if (attempt < this.maxRetry && Helpers.shouldRetryAxiosError(err)) {
          await Helpers.sleep(this.retryDelay);
          continue;
        }

        return { code: 500, message: "Network/Timeout error" };
      }
    }
  }
}

module.exports = new ApiService();
