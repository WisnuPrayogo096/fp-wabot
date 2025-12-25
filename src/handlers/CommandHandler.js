const HelpCommand = require("../bot/commands/HelpCommand");
const LoginCommand = require("../bot/commands/LoginCommand");
const LogoutCommand = require("../bot/commands/LogoutCommand");
const PresensiCommand = require("../bot/commands/PresensiCommand");
const MasjidCommand = require("../bot/commands/MasjidCommand");
const ReportCommand = require("../bot/commands/ReportCommand");
const AuthService = require("../services/AuthService");
const SessionHandler = require("./SessionHandler");
const RateLimiter = require("../middleware/RateLimiter");
const Formatter = require("../utils/formatter");
const LogRepository = require("../database/repositories/LogRepository");

class CommandHandler {
  async handle(message, wa_id, text) {
    const lower = text.toLowerCase();
    const chatId = message.from;

    try {
      // Session mode: pilih mesin dengan angka
      const session = SessionHandler.get(chatId);
      if (session.step !== "idle") {
        return await this._handleSessionChoice(message, wa_id, text, session);
      }

      // Rate limiting untuk command
      if (text.startsWith("/") && RateLimiter.isLimited(chatId)) {
        await message.reply(
          "⏳ Tunggu sebentar ya (anti spam). Coba lagi 2 detik."
        );
        return;
      }

      // Help
      if (lower === "/help" || lower === "help") {
        return await HelpCommand.execute(message);
      }

      // Login (tidak perlu auth)
      if (lower === "/login") {
        const phone = Formatter.normalizePhone(wa_id);
        return await LoginCommand.execute(message, wa_id, phone);
      }

      // Semua command lain butuh auth
      const auth = await AuthService.getAuth(wa_id);
      if (!auth?.token) {
        await message.reply(
          "Kamu belum login / token belum ada. Silakan */login* dulu."
        );
        return;
      }

      // Logout
      if (lower === "/logout") {
        return await LogoutCommand.execute(message, wa_id, auth);
      }

      // Presensi commands
      if (lower === "/in") {
        return await PresensiCommand.executeIn(message, wa_id, auth);
      }

      if (lower === "/out") {
        return await PresensiCommand.executeOut(message, wa_id, auth);
      }

      if (lower === "/fp-today") {
        return await PresensiCommand.executeToday(message, wa_id, auth);
      }

      // Masjid
      if (lower === "/pray") {
        return await MasjidCommand.execute(message, wa_id, auth);
      }

      // Reports
      if (lower.startsWith("/fp-rep")) {
        return await ReportCommand.executePresensi(message, wa_id, auth, text);
      }

      if (lower.startsWith("/fp-pray")) {
        return await ReportCommand.executeMasjid(message, wa_id, auth, text);
      }

      // Unknown command
      if (lower.startsWith("/")) {
        await message.reply(
          "Command tidak dikenal. Ketik */help* untuk daftar command."
        );
      }
    } catch (e) {
      console.error("[CommandHandler] Error:", e);

      await LogRepository.logRequest({
        wa_id,
        command: text.startsWith("/") ? text.split(/\s+/)[0] : "-",
        endpoint: null,
        http_method: null,
        response_code: 500,
        response_message: `handler_error: ${String(e?.message || e).slice(
          0,
          200
        )}`,
      });

      try {
        await message.reply("Terjadi error di bot. Coba lagi.");
      } catch {}
    }
  }

  async _handleSessionChoice(message, wa_id, text, session) {
    const n = parseInt(text, 10);
    if (!Number.isFinite(n) || n < 1) {
      await message.reply("Balas dengan *angka* sesuai pilihan ya.");
      return;
    }

    const mesinList = session.payload?.mesinList || [];
    const chosen = mesinList[n - 1];
    if (!chosen) {
      await message.reply("Pilihan tidak valid. Balas angka sesuai daftar.");
      return;
    }

    const auth = await AuthService.getAuth(wa_id);
    if (!auth?.token) {
      SessionHandler.clear(message.from);
      await message.reply("Token tidak ada. Silakan */login* dulu.");
      return;
    }

    // Route ke command yang sesuai
    if (session.step === "choose_presensi_for_in") {
      return await PresensiCommand.handleMesinChoice(
        message,
        wa_id,
        auth,
        chosen,
        0
      );
    }

    if (session.step === "choose_presensi_for_out") {
      return await PresensiCommand.handleMesinChoice(
        message,
        wa_id,
        auth,
        chosen,
        1
      );
    }

    if (session.step === "choose_masjid") {
      return await MasjidCommand.handleMesinChoice(
        message,
        wa_id,
        auth,
        chosen
      );
    }

    SessionHandler.clear(message.from);
    await message.reply("Session tidak dikenali. Ulangi perintah ya.");
  }
}

module.exports = new CommandHandler();
