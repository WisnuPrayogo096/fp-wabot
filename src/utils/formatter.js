class Formatter {
  static replyBox(title, lines = [], footer = "") {
    const body = lines.length ? lines.join("\n") : "(kosong)";
    return `*${title}*\n\n${body}${footer ? `\n\n${footer}` : ""}`;
  }

  static formatMesinList(mesinList) {
    return mesinList
      .map((m, idx) => `${idx + 1}) ${m.location} (${m.ip}) - ${m.connection}`)
      .join("\n");
  }

  static normalizePhone(wa_id) {
    const raw = (wa_id || "").split("@")[0] || "";
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      digits = "62" + digits.slice(1);
    }
    return digits;
  }

  static pickConnectedFirst(mesinList) {
    const connected = mesinList.filter(
      (m) => String(m.connection).toLowerCase() === "connected"
    );
    return connected.length ? connected[0] : mesinList[0];
  }

  static truncate(str, maxLength = 255) {
    if (!str) return "";
    return String(str).slice(0, maxLength);
  }

  static formatDateTime(isoString) {
    if (!isoString) return "-";

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString; // Return original if invalid

      // Convert to WIB (UTC+7)
      const wibOffset = 7 * 60; // 7 hours in minutes
      const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
      const wibTime = new Date(utcTime + wibOffset * 60000);

      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const day = wibTime.getDate();
      const month = months[wibTime.getMonth()];
      const year = wibTime.getFullYear();
      const hours = String(wibTime.getHours()).padStart(2, "0");
      const minutes = String(wibTime.getMinutes()).padStart(2, "0");
      const seconds = String(wibTime.getSeconds()).padStart(2, "0");

      return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} WIB`;
    } catch (e) {
      return isoString; // Return original if error
    }
  }
}

module.exports = Formatter;
