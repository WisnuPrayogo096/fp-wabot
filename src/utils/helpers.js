class Helpers {
  static nowISO() {
    return new Date().toISOString();
  }

  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static isUnauthorized(respData) {
    return (
      respData?.code === 201 &&
      String(respData?.message || "")
        .toLowerCase()
        .includes("unauthorized")
    );
  }

  static shouldRetryAxiosError(err) {
    if (!err) return false;
    if (err.code === "ECONNABORTED") return true; // timeout
    if (
      err.code === "ENOTFOUND" ||
      err.code === "ECONNRESET" ||
      err.code === "EAI_AGAIN"
    ) {
      return true;
    }
    const status = err.response?.status;
    if (status && status >= 500) return true;
    return false;
  }

  static axiosErrorToLog(err) {
    const status = err.response?.status;
    const code = err.code;
    const msg = err.message || "axios error";
    return `axios_fail${status ? `_http${status}` : ""}${
      code ? `_${code}` : ""
    }: ${msg}`.slice(0, 255);
  }
}

module.exports = Helpers;
