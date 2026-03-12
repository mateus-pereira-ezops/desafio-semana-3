import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
  ssl: { rejectUnauthorized: false },
});

pool.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log("table tasks ready"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/db-time", async (_req, res) => {
  const result = await pool.query("SELECT now() as now");
  res.json({ now: result.rows[0].now });
});

app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/api/tasks", async (_req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
  res.json(result.rows);
});

app.get("/api/tasks/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "not found" });
  res.json(result.rows[0]);
});

app.put("/api/tasks/:id", async (req, res) => {
  const { title, done } = req.body;
  const result = await pool.query(
    "UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING *",
    [title, done, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "not found" });
  res.json(result.rows[0]);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "not found" });
  res.json({ deleted: result.rows[0] });
});

app.listen(port, () => console.log(`backend listening on :${port}`));
