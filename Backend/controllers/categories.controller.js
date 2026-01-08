import * as service from "../services/categories.service.js";

export const getCategories = async (req, res, next) => {
  try {
    const data = await service.getCategories();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getCategoriesById = async (req, res, next) => {
  try {
    const categroy = await service.getCategoriesById(
      req.params.id
    );

    if (!categroy) {
      return res.status(404).json({ error: "categroy introuvable" });
    }

    res.json(categroy);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { label, type } = req.body;

    if (!label) {
      return res.status(400).json({ error: "Label requis" });
    }

    const category = await service.createCategory({ label, type });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, type } = req.body;

    const category = await service.updateCategory(id, { label, type });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await service.deleteCategory(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
