import { z } from "zod";
import * as service from "../services/categories.service.js";
import { handleZodError } from "../helpers/handleZodError.js";

// Schémas de validation
const createCategorySchema = z.object({
  label: z.string().min(1, "Le label ne peut pas être vide")
});

const updateCategorySchema = z.object({
  label: z.string().min(1, "Le label ne peut pas être vide").optional()
});

const idParamSchema = z.object({
  id: z.coerce.number().int("L'ID doit être un ID valide"),
});

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
    const validatedData = createCategorySchema.parse(req.body);
    const category = await service.createCategory(validatedData);
    res.status(201).json(category);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);
    
    const category = await service.updateCategory(id, validatedData);
    res.json(category);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await service.deleteCategory(id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    next(err);
  }
};