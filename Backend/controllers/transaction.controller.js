import * as transactionService from "../services/transaction.service.js";

export const createTransaction = async (req, res, next) => {
    try {
        const { montant, libelle, type, date, id_categorie } = req.body;

        if (!montant || !libelle || !type || !date || !id_categorie) {
            return res.status(400).json({ error: "Champs manquants" });
        }

        const transaction = await transactionService.createTransaction({ montant, libelle, type, date, id_categorie });
        res.status(201).json(transaction);

    } catch (err) {
        next(err);
    }
};

export const getTransactions = async (req, res, next) => {
    try {
        const { date_after, date_before } = req.query;
        const transactions = await transactionService.getTransactionsByPeriod({ date_after, date_before });
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};
