import express from "express";
import * as controller from "../controllers/budgets.controller.js";

const router = express.Router();

router.get("/", controller.getBudgets);
router.get("/alerts", controller.getBudgetAlerts);
router.get("/:id", controller.getBudgetById);

router.post("/", controller.createBudget);

router.put("/:id", controller.updateBudget);

router.delete("/:id", controller.deleteBudget);

router.post("/rollover", controller.createBudgetWithRollover);

export default router;
