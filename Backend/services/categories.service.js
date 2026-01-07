import { db } from "../db.js";

export const getCategories = async () => {
  const { rows } = await db.query(
    "SELECT * FROM categories ORDER BY label"
  );
  return rows;
};

export const createCategory = async ({ label, type = "expense" }) => {
  const { rows } = await db.query(
    `INSERT INTO categories (label, type)
     VALUES ($1, $2)
     RETURNING *`,
    [label, type]
  );
  return rows[0];
};

export const updateCategory = async (id, { label, type }) => {
  const { rows } = await db.query(
    `UPDATE categories
     SET label = COALESCE($2, label),
         type = COALESCE($3, type)
     WHERE category_id = $1
     RETURNING *`,
    [id, label, type]
  );
  return rows[0];
};

export const deleteCategory = async (id) => {
  await db.query(
    "DELETE FROM categories WHERE category_id = $1",
    [id]
  );
};
