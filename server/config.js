const required = ["DATABASE_URL", "JWT_SECRET", "ESCROW_HMAC_SECRET"];
function getConfig() {
  if (process.env.NODE_ENV === "production") {
    const missing = required.filter((x) => !process.env[x]);
    if (missing.length)
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
  return {
    port: Number(process.env.PORT || 5000),
    databaseUrl:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/authentikey",
    jwtSecret: process.env.JWT_SECRET || "development-jwt-secret",
    escrowHmacSecret:
      process.env.ESCROW_HMAC_SECRET || "development-escrow-secret",
    aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
    clientOrigin: process.env.CLIENT_ORIGIN || "*",
  };
}
module.exports = { getConfig };
