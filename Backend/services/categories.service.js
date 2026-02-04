import { db } from "../db.js";

export const getCategories = async () => {
  const { rows } = await db.query(
    "SELECT * FROM categories ORDER BY label"
  );
  return rows;
};

export const getCategoriesById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM categories WHERE category_id = $1`,
    [id]
  );
  return rows[0];
};

export const createCategory = async ({ label }) => {
  const { rows } = await db.query(
    `INSERT INTO categories (label)
     VALUES ($1)
     RETURNING *`,
    [label]
  );
  return rows[0];
};

export const updateCategory = async (id, { label }) => {
  const { rows } = await db.query(
    `UPDATE categories
     SET label = COALESCE($2, label)
     WHERE category_id = $1
     RETURNING *`,
    [id, label]
  );
  return rows[0];
};

export const deleteCategory = async (id) => {
  await db.query(
    "DELETE FROM categories WHERE category_id = $1",
    [id]
  );
};
