import { db } from "../db.js";

export const createTransaction = async ({
  amount,
  label,
  type,
  transaction_date,
  category_id,
}) => {
  const { rows } = await db.query(
    `INSERT INTO transactions
      (amount, label, type, transaction_date, category_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [amount, label, type, transaction_date, category_id]
  );

  return rows[0];
};

export const getTransactions = async ({
  date_after,
  date_before,
  category_id,
  type,
  limit = 50,
  offset = 0,
}) => {
  let sql = `
    SELECT t.*, c.label AS category_label
    FROM transactions t
    LEFT JOIN categories c ON c.category_id = t.category_id
    WHERE 1=1
  `;
  const params = [];

  if (date_after) {
    params.push(date_after);
    sql += ` AND t.transaction_date >= $${params.length}`;
  }

  if (date_before) {
    params.push(date_before);
    sql += ` AND t.transaction_date <= $${params.length}`;
  }

  if (category_id) {
    params.push(category_id);
    sql += ` AND t.category_id = $${params.length}`;
  }

  if (type) {
    params.push(type);
    sql += ` AND t.type = $${params.length}`;
  }

  sql += `
    ORDER BY t.transaction_date DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  params.push(limit, offset);

  const { rows } = await db.query(sql, params);
  return rows;
};

export const getTransactionById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM transactions WHERE transaction_id = $1`,
    [id]
  );
  return rows[0];
};

export const updateTransaction = async (id, data) => {
  const { rows } = await db.query(
    `UPDATE transactions
     SET
       amount = COALESCE($2, amount),
       label = COALESCE($3, label),
       type = COALESCE($4, type),
       transaction_date = COALESCE($5, transaction_date),
       category_id = COALESCE($6, category_id)
     WHERE transaction_id = $1
     RETURNING *`,
    [
      id,
      data.amount,
      data.label,
      data.type,
      data.transaction_date,
      data.category_id,
    ]
  );

  return rows[0];
};

export const deleteTransaction = async (id) => {
  const { rowCount } = await db.query(
    `DELETE FROM transactions WHERE transaction_id = $1`,
    [id]
  );

  return rowCount > 0;
};
