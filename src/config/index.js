require("dotenv").config();

module.exports = {
  app: {
    baseUrl: process.env.BASE_URL,
  },

  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    timezone: "Z",
  },

  cache: {
    ttlMs: Number(process.env.CACHE_TTL_MS || 20 * 60 * 1000), // 20 menit
    sweepMs: Number(process.env.CACHE_SWEEP_MS || 60 * 1000), // 1 menit
  },

  http: {
    timeoutMs: Number(process.env.HTTP_TIMEOUT_MS || 15000),
    maxRetry: Number(process.env.HTTP_MAX_RETRY || 1),
    retryDelayMs: Number(process.env.HTTP_RETRY_DELAY_MS || 400),
  },

  rateLimit: {
    windowMs: 2000, // 2 detik
  },

  whatsapp: {
    authStrategy: "local",
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },
};