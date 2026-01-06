import express from "express";
import "dotenv/config";
import transactionRoutes from "./routes/transaction.routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/transaction", transactionRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
