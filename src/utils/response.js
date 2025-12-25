// src/utils/response.js
class Response {
  static success(data, message = "Success") {
    return { success: true, data, message };
  }

  static error(message, code = 500) {
    return { success: false, message, code };
  }

  static unauthorized() {
    return { success: false, message: "Unauthorized", code: 401 };
  }
}

module.exports = Response;