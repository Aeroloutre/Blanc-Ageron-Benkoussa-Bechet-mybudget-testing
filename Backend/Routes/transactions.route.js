import express from "express";
import * as transactionController from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getTransactions);

export default router;
