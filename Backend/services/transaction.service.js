import { db } from "../db.js";

export const createTransaction = async ({ montant, libelle, type, date, id_categorie }) => {
    const [result] = await db.execute(
        `INSERT INTO transactions (montant, libelle, type, date, id_categorie) VALUES (?, ?, ?, ?, ?)`,
        [montant, libelle, type, date, id_categorie]
    );
    return { id: result.insertId, montant, libelle, type, date, id_categorie };
};

export const getTransactionsByPeriod = async ({ date_after, date_before }) => {
    let sql = "SELECT * FROM transactions WHERE 1=1";
    const params = [];

    if (date_after) {
        sql += " AND date >= ?";
        params.push(date_after);
    }

    if (date_before) {
        sql += " AND date <= ?";
        params.push(date_before);
    }

    const [rows] = await db.execute(sql, params);
    return rows;
};
