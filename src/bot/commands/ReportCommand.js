const ReportService = require("../../services/ReportService");
const AuthService = require("../../services/AuthService");
const Formatter = require("../../utils/formatter");
const Helpers = require("../../utils/helpers");

class ReportCommand {
  async executePresensi(message, wa_id, auth, text) {
    const parts = text.split(/\s+/);
    const bulan = parseInt(parts[1], 10);
    const tahun = parseInt(parts[2], 10);
    const page = parseInt(parts[3], 10) || 1;

    if (!bulan || !tahun) {
      await message.reply(
        "Format: */fp-rep <bulan> <tahun> <page>*\nContoh: /fp-rep 6 2025 1"
      );
      return;
    }

    const resp = await ReportService.getPresensiReport(
      wa_id,
      auth.token,
      bulan,
      tahun,
      page
    );

    if (Helpers.isUnauthorized(resp)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (resp.code !== 200) {
      await message.reply(
        `❌ Gagal ambil laporan: ${resp.message || "Unknown error"}`
      );
      return;
    }

    const items = resp.data?.items || [];
    const lines = items.slice(0, 10).map((it) => {
      const recs = it.records || [];
      const masuk = recs.filter((r) => r.status === 0).length;
      const pulang = recs.filter((r) => r.status === 1).length;
      return `- ${it.date}: masuk ${masuk}, pulang ${pulang} (total ${recs.length})`;
    });

    const cur = resp.data?.current_page || page;
    const last = resp.data?.last_page || cur;

    const footer = [
      `Halaman: ${cur}/${last}`,
      `Total data: ${resp.data?.total ?? 0}`,
      cur < last ? `Next: /fp-rep ${bulan} ${tahun} ${cur + 1}` : "Next: -",
      cur > 1 ? `Prev: /fp-rep ${bulan} ${tahun} ${cur - 1}` : "Prev: -",
    ].join("\n");

    await message.reply(
      Formatter.replyBox(`📄 Laporan Presensi ${bulan}-${tahun}`, lines, footer)
    );
  }

  async executeMasjid(message, wa_id, auth, text) {
    const parts = text.split(/\s+/);
    const bulan = parseInt(parts[1], 10);
    const tahun = parseInt(parts[2], 10);
    const page = parseInt(parts[3], 10) || 1;

    if (!bulan || !tahun) {
      await message.reply(
        "Format: */fp-pray <bulan> <tahun> <page>*\nContoh: /fp-pray 6 2025 1"
      );
      return;
    }

    const resp = await ReportService.getMasjidReport(
      wa_id,
      auth.token,
      bulan,
      tahun,
      page
    );

    if (Helpers.isUnauthorized(resp)) {
      await AuthService.clearAuth(wa_id);
      await message.reply(
        "❌ *Unauthorized*. Token habis/invalid. Silakan */login* ulang."
      );
      return;
    }

    if (resp.code !== 200) {
      await message.reply(
        `❌ Gagal ambil laporan masjid: ${resp.message || "Unknown error"}`
      );
      return;
    }

    const items = resp.data?.items || [];
    const lines = items
      .slice(0, 12)
      .map((it) => `- ${it.date}: ${(it.records || []).length} record`);

    const cur = resp.data?.current_page || page;
    const last = resp.data?.last_page || cur;

    const footer = [
      `Halaman: ${cur}/${last}`,
      `Total data: ${resp.data?.total ?? 0}`,
      cur < last ? `Next: /fp-pray ${bulan} ${tahun} ${cur + 1}` : "Next: -",
      cur > 1 ? `Prev: /fp-pray ${bulan} ${tahun} ${cur - 1}` : "Prev: -",
    ].join("\n");

    await message.reply(
      Formatter.replyBox(`🕌 Laporan Masjid ${bulan}-${tahun}`, lines, footer)
    );
  }
}

module.exports = new ReportCommand();
