import { z } from "zod";
import * as service from "../services/budgets.service.js";
import { handleZodError } from "../helpers/handleZodError.js";

// Schémas de validation
const createBudgetSchema = z.object({
  category_id: z.number().int().positive("L'ID de catégorie doit être un entier positif"),
  allocated_amount: z.number().positive("Le montant alloué doit être positif"),
  period_start: z.string("La date de début doit être au format YYYY-MM-DD"),
  period_end: z.string("La date de fin doit être au format YYYY-MM-DD"),
});

const updateBudgetSchema = z.object({
  category_id: z.number().int().positive("L'ID de catégorie doit être un entier positif").optional(),
  allocated_amount: z.number().positive("Le montant alloué doit être positif").optional(),
  period_start: z.string("La date de début doit être au format YYYY-MM-DD")
    .optional(),
  period_end: z.string("La date de fin doit être au format YYYY-MM-DD")
    .optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int("L'ID doit être un entier valide"),
});

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
    const validatedData = createBudgetSchema.parse(req.body);
    const budget = await service.createBudget(validatedData);
    res.status(201).json(budget);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateBudgetSchema.parse(req.body);
    const budget = await service.updateBudget(id, validatedData);
    res.json(budget);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await service.deleteBudget(id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};




export const getBudgetAlerts = async (req, res, next) => {
  try {
    const alerts = await service.getBudgetAlerts();
    res.json({ alerts, count: alerts.length });
  } catch (err) {
    next(err);
  }
};


export const createBudgetWithRollover = async (req, res, next) => {
  try {
    const validatedData = createBudgetSchema.parse(req.body);
    const budget = await service.createBudgetWithRollover(validatedData);
    res.status(201).json(budget);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};