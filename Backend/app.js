import express from "express";
import 'dotenv/config';

import transactionRoutes from "./routes/transactions.route.js";
import categoryRoutes from "./routes/categories.route.js";
import budgetRoutes from "./routes/budgets.route.js";
import db from "./db.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

// Routes DB health
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/health/db", async (req, res) => {
  try {
    const r = await db.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Les routes
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/budgets", budgetRoutes);

// Le middleware d'errreur centarlisé
app.use(errorMiddleware);

export default app;
