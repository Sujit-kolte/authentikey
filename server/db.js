const { Pool } = require("pg");
const { getConfig } = require("./config");
const pool = new Pool({
  connectionString: getConfig().databaseUrl,
  max: Number(process.env.DB_POOL_MAX || 10),
  connectionTimeoutMillis: 5000,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});
pool.on("error", (error) => console.error("PostgreSQL pool error", error));
async function query(text, values) {
  return pool.query(text, values);
}
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
module.exports = { pool, query, withTransaction };
