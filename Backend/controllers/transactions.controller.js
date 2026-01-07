import * as transactionService from "../services/transactions.service.js";

export const createTransaction = async (req, res, next) => {
  try {
    const { amount, label, type, transaction_date, category_id } = req.body;

    if (!amount || !type || !transaction_date) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const transaction = await transactionService.createTransaction({
      amount,
      label,
      type,
      transaction_date,
      category_id,
    });

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const {
      date_after,
      date_before,
      category_id,
      type,
      limit,
      offset,
    } = req.query;

    const transactions = await transactionService.getTransactions({
      date_after,
      date_before,
      category_id,
      type,
      limit,
      offset,
    });

    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.body
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const deleted = await transactionService.deleteTransaction(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
