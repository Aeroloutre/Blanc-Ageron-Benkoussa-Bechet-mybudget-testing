import express from "express";
import 'dotenv/config';

import transactionRoutes from "./routes/transactions.route.js";
import categoryRoutes from "./routes/categories.route.js";
import budgetRoutes from "./routes/budgets.route.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

// Les routes
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/budgets", budgetRoutes);

// Le middleware d'errreur centarlisé
app.use(errorMiddleware);

export default app;
