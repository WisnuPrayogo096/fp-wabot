const AuthService = require("../../services/AuthService");
const SessionHandler = require("../../handlers/SessionHandler");
const Helpers = require("../../utils/helpers");

class LogoutCommand {
  async execute(message, wa_id, auth) {
    const resp = await AuthService.logout(wa_id, auth.token);
    SessionHandler.clear(message.from);

    if (Helpers.isUnauthorized(resp)) {
      await message.reply(
        "✅ Token dihapus. (Sesi server sudah tidak valid / unauthorized)"
      );
      return;
    }

    if (resp.code === 200) {
      await message.reply(
        `✅ Logout OK: ${resp.data?.message || "Successfully logged out."}`
      );
    } else {
      await message.reply(
        `ℹ️ Token dihapus. Response server: ${resp.message || "Unknown"}`
      );
    }
  }
}

module.exports = new LogoutCommand();
