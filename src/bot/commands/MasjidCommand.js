const MasjidService = require("../../services/MasjidService");
const AuthService = require("../../services/AuthService");
const SessionHandler = require("../../handlers/SessionHandler");
const Formatter = require("../../utils/formatter");
const Helpers = require("../../utils/helpers");

class MasjidCommand {
  async execute(message, wa_id, auth) {
    const mesin = await MasjidService.getMesinList(wa_id, auth.token);

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
        `❌ Mesin masjid tidak tersedia: ${mesin.message || "Unknown error"}`
      );
      return;
    }

    const list = mesin.data;

    // Jika hanya 1 mesin, langsung absen
    if (list.length === 1) {
      await this._createAbsenMasjid(message, wa_id, auth.token, list[0]);
      return;
    }

    // Lebih dari 1, minta pilih
    SessionHandler.set(message.from, "choose_masjid", { mesinList: list });
    await message.reply(
      Formatter.replyBox("Pilih mesin masjid (balas angka)", [
        Formatter.formatMesinList(list),
      ])
    );
  }

  async _createAbsenMasjid(message, wa_id, token, mesin) {
    // Cek jadwal sholat dulu
    const jadwal = await MasjidService.getJadwalSholat(wa_id, token);

    if (Helpers.isUnauthorized(jadwal)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (jadwal.code !== 200) {
      await message.reply(
        `❌ Gagal ambil jadwal sholat: ${jadwal.message || "Unknown error"}`
      );
      return;
    }

    const active = !!jadwal.data?.active;
    const status = !!jadwal.data?.status;
    const infoMsg = jadwal.data?.message || "(tanpa message)";

    // Jika active false, tampilkan message dan tidak bisa absen
    if (!active) {
      await message.reply(`ℹ️ ${infoMsg}`);
      return;
    }

    // Jika active true tapi status true, sudah absen
    if (active && status) {
      await message.reply(
        "ℹ️ Anda sudah melakukan absen sholat pada waktu ini"
      );
      return;
    }

    const resp = await MasjidService.createAbsenMasjid(wa_id, token, mesin.id);

    if (Helpers.isUnauthorized(resp)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (resp.code === 200) {
      await message.reply(
        Formatter.replyBox("✅ Absen Sholat OK", [
          `Info: ${infoMsg}`,
          `Mesin: ${mesin.location} (${mesin.ip})`,
          `Waktu: ${Formatter.formatDateTime(resp.data?.waktu_finger)}`,
        ])
      );
    } else {
      await message.reply(
        `❌ Gagal absen sholat: ${resp.message || "Unknown error"}`
      );
    }
  }

  async handleMesinChoice(message, wa_id, auth, chosen) {
    SessionHandler.clear(message.from);
    await this._createAbsenMasjid(message, wa_id, auth.token, chosen);
  }
}

module.exports = new MasjidCommand();
