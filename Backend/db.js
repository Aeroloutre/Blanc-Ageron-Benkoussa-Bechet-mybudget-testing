import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "user-pwd",
  database: process.env.DB_NAME || "mybudget",
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
});

export const db = {
  query: (text, params) => pool.query(text, params),
  pool,
};

export default db;

