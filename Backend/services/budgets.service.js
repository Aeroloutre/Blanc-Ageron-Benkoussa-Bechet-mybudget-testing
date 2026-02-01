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

export const getBudgetById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM budgets WHERE budget_id = $1`,
    [id]
  );
  return rows[0];
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

// Alertes budgétaires
export const getBudgetAlerts = async () => {
  const { rows } = await db.query(`
    SELECT * FROM budget_status
    WHERE status IN ('WARNING', 'OVER_BUDGET')
    ORDER BY percent_used DESC
  `);
  return rows;
};

// Vérifier impact transaction sur budget
export const checkBudgetAfterTransaction = async ({ category_id, amount, transaction_date, type }) => {
  if (type !== 'expense') return { alert: false };

  const { rows } = await db.query(`
    SELECT b.allocated_amount, COALESCE(SUM(t.amount), 0) as spent_amount
    FROM budgets b
    LEFT JOIN transactions t ON t.category_id = b.category_id AND t.type = 'expense'
      AND t.transaction_date BETWEEN b.period_start AND b.period_end
    WHERE b.category_id = $1 AND $2::date BETWEEN b.period_start AND b.period_end
    GROUP BY b.allocated_amount
  `, [category_id, transaction_date]);

  if (rows.length === 0) return { alert: false };

  const newTotal = parseFloat(rows[0].spent_amount) + amount;
  const allocated = parseFloat(rows[0].allocated_amount);
  const percent = (newTotal / allocated) * 100;

  return {
    alert: percent >= 80,
    status: newTotal > allocated ? 'OVER_BUDGET' : percent >= 80 ? 'WARNING' : 'OK',
    percent: percent.toFixed(2)
  };
};

// Report de budget
export const createBudgetWithRollover = async ({ category_id, allocated_amount, period_start, period_end }) => {
  const { rows: prev } = await db.query(`
    SELECT b.allocated_amount, COALESCE(SUM(t.amount), 0) as spent
    FROM budgets b
    LEFT JOIN transactions t ON t.category_id = b.category_id AND t.type = 'expense'
      AND t.transaction_date BETWEEN b.period_start AND b.period_end
    WHERE b.category_id = $1 AND b.period_end < $2
    GROUP BY b.allocated_amount ORDER BY b.period_end DESC LIMIT 1
  `, [category_id, period_start]);

  const rollover = prev.length > 0 ? parseFloat(prev[0].allocated_amount) - parseFloat(prev[0].spent) : 0;
  const finalAmount = allocated_amount + rollover;

  const { rows } = await db.query(
    `INSERT INTO budgets (category_id, allocated_amount, period_start, period_end)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [category_id, finalAmount, period_start, period_end]
  );

  return { ...rows[0], rollover };
};


/**
 * Répartit un revenu entre plusieurs catégories
 */
export const distributeIncomeToEnvelopes = async ({ 
  income_amount, 
  period_start, 
  period_end, 
  distribution 
}) => {
  const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
  if (totalPercentage !== 100) {
    throw new Error('Les pourcentages doivent totaliser 100%');
  }

  const createdBudgets = [];
  for (const { category_id, percentage } of distribution) {
    const allocated = (income_amount * percentage) / 100;
    const { rows } = await db.query(
      `INSERT INTO budgets (category_id, allocated_amount, period_start, period_end)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [category_id, allocated, period_start, period_end]
    );
    createdBudgets.push({ ...rows[0], percentage });
  }

  return { income_amount, budgets: createdBudgets };
};