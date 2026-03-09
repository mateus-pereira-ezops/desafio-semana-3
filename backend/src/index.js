import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

const port = process.env.PORT || 3001;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/db-time", async (_req, res) => {
  const result = await pool.query("SELECT now() as now");
  res.json({ now: result.rows[0].now });
});

app.listen(port, () => {
  console.log(`backend listening on :${port}`);
});
