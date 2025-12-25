const PresensiService = require("../../services/PresensiService");
const AuthService = require("../../services/AuthService");
const SessionHandler = require("../../handlers/SessionHandler");
const Formatter = require("../../utils/formatter");
const Helpers = require("../../utils/helpers");

class PresensiCommand {
  async executeIn(message, wa_id, auth) {
    return this._executePresensi(
      message,
      wa_id,
      auth,
      0,
      "choose_presensi_for_in"
    );
  }

  async executeOut(message, wa_id, auth) {
    return this._executePresensi(
      message,
      wa_id,
      auth,
      1,
      "choose_presensi_for_out"
    );
  }

  async executeToday(message, wa_id, auth) {
    const resp = await PresensiService.getTodayPresensi(wa_id, auth.token);

    if (Helpers.isUnauthorized(resp)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (resp.code !== 200) {
      await message.reply(
        `❌ Gagal ambil presensi hari ini: ${resp.message || "Unknown error"}`
      );
      return;
    }

    const items = Array.isArray(resp.data) ? resp.data : [];
    const lines = items.length
      ? items
          .slice(0, 15)
          .map(
            (x) =>
              `- ${x.tanggal_absen} (${x.status === 0 ? "Masuk" : "Pulang"})`
          )
      : ["(kosong)"];

    await message.reply(Formatter.replyBox("📌 Presensi Hari Ini", lines));
  }

  async _executePresensi(message, wa_id, auth, status, sessionStep) {
    const mesin = await PresensiService.getMesinList(wa_id, auth.token);

    if (Helpers.isUnauthorized(mesin)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (
      mesin.code !== 200 ||
      !Array.isArray(mesin.data) ||
      mesin.data.length === 0
    ) {
      await message.reply(
        `❌ Mesin presensi tidak tersedia: ${mesin.message || "Unknown error"}`
      );
      return;
    }

    const list = mesin.data;

    // Jika hanya 1 mesin, langsung absen
    if (list.length === 1) {
      await this._createPresensi(message, wa_id, auth.token, list[0], status);
      return;
    }

    // Lebih dari 1, minta pilih
    const recommended = Formatter.pickConnectedFirst(list);
    SessionHandler.set(message.from, sessionStep, { mesinList: list });

    const title =
      status === 0
        ? "Pilih mesin presensi (balas angka)"
        : "Pilih mesin presensi untuk absen pulang (balas angka)";
    await message.reply(
      Formatter.replyBox(
        title,
        [Formatter.formatMesinList(list)],
        `Rekomendasi: *${recommended.location}* (${recommended.connection})`
      )
    );
  }

  async _createPresensi(message, wa_id, token, mesin, status) {
    const resp = await PresensiService.createPresensi(
      wa_id,
      token,
      mesin.id,
      status
    );

    if (Helpers.isUnauthorized(resp)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (resp.code === 200) {
      const title = status === 0 ? "✅ Absen Masuk OK" : "✅ Absen Pulang OK";
      await message.reply(
        Formatter.replyBox(title, [
          `Mesin: ${mesin.location} (${mesin.ip})`,
          `Waktu: ${resp.data?.tanggal_absen || "-"}`,
          `ID: ${resp.data?.id || "-"}`,
        ])
      );
    } else {
      const action = status === 0 ? "masuk" : "pulang";
      await message.reply(
        `❌ Gagal absen ${action}: ${resp.message || "Unknown error"}`
      );
    }
  }

  async handleMesinChoice(message, wa_id, auth, chosen, status) {
    SessionHandler.clear(message.from);
    await this._createPresensi(message, wa_id, auth.token, chosen, status);
  }
}

module.exports = new PresensiCommand();
