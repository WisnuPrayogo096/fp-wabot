const AuthService = require("../../services/AuthService");
const Formatter = require("../../utils/formatter");

class LoginCommand {
  async execute(message, wa_id, phone) {
    const resp = await AuthService.login(wa_id, phone);

    if (resp.code === 200 && resp.data?.token) {
      await AuthService.saveAuth(wa_id, {
        phone,
        token: resp.data.token,
        id_finger: resp.data.idf,
        full_name: resp.data.full_name,
        no_telp: resp.data.no_telp,
      });

      const reply = Formatter.replyBox("✅ Login OK", [
        `Nama: ${resp.data.full_name}`,
        `ID Finger: ${resp.data.idf}`,
        `No: ${resp.data.no_telp}`,
        "Token tersimpan (DB).",
      ]);

      await message.reply(reply);
    } else {
      await message.reply(`❌ Login gagal: ${resp.message || "Unknown error"}`);
    }
  }
}

module.exports = new LoginCommand();
