import express from "express";
import * as controller from "../controllers/transactions.controller.js";

const router = express.Router();

router.get("/", controller.getTransactions);
router.get("/:id", controller.getTransactionById);

router.post("/", controller.createTransaction);

router.put("/:id", controller.updateTransaction);

router.delete("/:id", controller.deleteTransaction);

export default router;
