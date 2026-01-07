import { db } from "../db.js";

export const getBudgets = async () => {
  const { rows } = await db.query(
    `SELECT b.*, c.label AS category_label
     FROM budgets b
     JOIN categories c ON c.category_id = b.category_id
     ORDER BY period_start DESC`
  );
  return rows;
};

export const createBudget = async (data) => {
  const { rows } = await db.query(
    `INSERT INTO budgets (category_id, allocated_amount, period_start, period_end)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      data.category_id,
      data.allocated_amount,
      data.period_start,
      data.period_end,
    ]
  );
  return rows[0];
};

export const updateBudget = async (id, data) => {
  const { rows } = await db.query(
    `UPDATE budgets
     SET allocated_amount = COALESCE($2, allocated_amount),
         period_start = COALESCE($3, period_start),
         period_end = COALESCE($4, period_end)
     WHERE budget_id = $1
     RETURNING *`,
    [id, data.allocated_amount, data.period_start, data.period_end]
  );
  return rows[0];
};

export const deleteBudget = async (id) => {
  await db.query("DELETE FROM budgets WHERE budget_id = $1", [id]);
};
