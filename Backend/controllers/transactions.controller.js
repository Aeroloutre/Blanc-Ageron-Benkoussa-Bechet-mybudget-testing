import { z } from "zod";
import * as transactionService from "../services/transactions.service.js";
import * as budgetService from "../services/budgets.service.js";  
import { handleZodError } from "../helpers/handleZodError.js";

// Schémas de validation
const createTransactionSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  label: z.string().optional(),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Le type doit être 'income' ou 'expense'" }),
  }),
  transaction_date: z.string("La date doit être au format YYYY-MM-DD"),
  category_id: z.number().int().positive("L'ID de catégorie doit un ID valable").optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive("Le montant doit être positif").optional(),
  label: z.string().optional(),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Le type doit être 'income' ou 'expense'" }),
  }).optional(),
  transaction_date: z.string().datetime("La date doit être au format YYYY-MM-DD")
    .optional(),
  category_id: z.number().int().positive("L'ID de catégorie doit un ID valable").optional(),
});

const getTransactionsQuerySchema = z.object({
  date_after: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  date_before: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  category_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  type: z.enum(["income", "expense"]).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int("L'ID doit être un entier valide"),
});

export const createTransaction = async (req, res, next) => {
  try {
    const validatedData = createTransactionSchema.parse(req.body);
    // Vérifier l'impact sur le budget AVANT de créer
    const budgetCheck = await budgetService.checkBudgetAfterTransaction(validatedData);
    const transaction = await transactionService.createTransaction(validatedData);
    // Inclure l'alerte dans la réponse si nécessaire
    res.status(201).json({
      transaction,
      ...(budgetCheck.alert && { alert: budgetCheck })
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const validatedQuery = getTransactionsQuerySchema.parse(req.query);
    const transactions = await transactionService.getTransactions(validatedQuery);
    res.json(transactions);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const transaction = await transactionService.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    res.json(transaction);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateTransactionSchema.parse(req.body);
    const transaction = await transactionService.updateTransaction(id, validatedData);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    res.json(transaction);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const deleted = await transactionService.deleteTransaction(id);

    if (!deleted) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    res.status(204).end();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};