import * as service from "../services/budgets.service.js";

export const getBudgets = async (req, res, next) => {
  try {
    const data = await service.getBudgets();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getBudgetById = async (req, res, next) => {
  console.log("HIT /budgets/:id", req.params.id);

  try {
    const budget = await service.getBudgetById(
      req.params.id
    );

    if (!budget) {
      return res.status(404).json({ error: "Budget introuvable" });
    }

    res.json(budget);
  } catch (err) {
    next(err);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const { category_id, allocated_amount, period_start, period_end } = req.body;

    if (!category_id || !allocated_amount || !period_start || !period_end) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const budget = await service.createBudget({
      category_id,
      allocated_amount,
      period_start,
      period_end,
    });

    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await service.updateBudget(req.params.id, req.body);
    res.json(budget);
  } catch (err) {
    next(err);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    await service.deleteBudget(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
