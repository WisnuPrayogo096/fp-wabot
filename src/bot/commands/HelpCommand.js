const Formatter = require("../../utils/formatter");

class HelpCommand {
  async execute(message) {
    const reply = Formatter.replyBox("📌 Daftar Perintah", [
      "*/login* - login & simpan token",
      "*/pray* - absen sholat (cek jadwal)",
      "*/in* - absen masuk (status 0)",
      "*/out* - absen pulang (status 1)",
      "*/fp-rep <bulan> <tahun> <page>* - laporan presensi",
      "*/fp-pray <bulan> <tahun> <page>* - laporan masjid",
      "*/fp-today* - presensi hari ini",
      "*/logout* - logout token",
    ]);

    await message.reply(reply);
  }
}

module.exports = new HelpCommand();
