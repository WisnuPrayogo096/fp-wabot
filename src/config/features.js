module.exports = {
  ENABLE_RATE_LIMIT: process.env.ENABLE_RATE_LIMIT !== "false",
  ENABLE_CACHE: process.env.ENABLE_CACHE !== "false",
  ENABLE_RETRY: process.env.ENABLE_RETRY !== "false",
  ENABLE_METRICS: process.env.ENABLE_METRICS === "true",
  MAX_MESSAGE_LENGTH: 1000,
  SESSION_TIMEOUT_MINUTES: 30,
};
