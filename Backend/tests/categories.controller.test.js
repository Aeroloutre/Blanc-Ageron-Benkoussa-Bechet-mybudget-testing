import { jest } from '@jest/globals';

const mockGetCategories = jest.fn();
const mockGetCategoriesById = jest.fn();
const mockCreateCategory = jest.fn();
const mockUpdateCategory = jest.fn();
const mockDeleteCategory = jest.fn();

jest.unstable_mockModule('../services/categories.service.js', () => ({
  getCategories: mockGetCategories,
  getCategoriesById: mockGetCategoriesById,
  createCategory: mockCreateCategory,
  updateCategory: mockUpdateCategory,
  deleteCategory: mockDeleteCategory
}));

const mockHandleZodError = jest.fn();
jest.unstable_mockModule('../helpers/handleZodError.js', () => ({
  handleZodError: mockHandleZodError
}));

const { 
  getCategories, 
  getCategoriesById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = await import('../controllers/categories.controller.js');

describe('Categories Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = { body: {}, params: {}, query: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    next = jest.fn();
  });

  describe('getCategories', () => {
    test('retourne toutes les catégories', async () => {
      const mockCategories = [
        { category_id: 1, label: 'Alimentation' }
      ];
      mockGetCategories.mockResolvedValue(mockCategories);

      await getCategories(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });
  });

  describe('getCategoriesById', () => {
    test('retourne une catégorie existante', async () => {
      const mockCategory = { category_id: 1, label: 'Alimentation' };
      req.params.id = '1';
      mockGetCategoriesById.mockResolvedValue(mockCategory);

      await getCategoriesById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    test('retourne 404 si catégorie inexistante', async () => {
      req.params.id = '999';
      mockGetCategoriesById.mockResolvedValue(null);

      await getCategoriesById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createCategory', () => {
    test('crée une catégorie avec données valides', async () => {
      const mockCategory = { category_id: 1, label: 'Loisirs' };
      req.body = { label: 'Loisirs' };
      mockCreateCategory.mockResolvedValue(mockCategory);

      await createCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });
  });

  describe('updateCategory', () => {
    test('met à jour une catégorie avec données valides', async () => {
      const mockCategory = { category_id: 1, label: 'Alimentation Bio' };
      req.params = { id: 1 };
      req.body = { label: 'Alimentation Bio' };
      mockUpdateCategory.mockResolvedValue(mockCategory);

      await updateCategory(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    test('supprime une catégorie avec succès', async () => {
      req.params = { id: 1 };
      mockDeleteCategory.mockResolvedValue();

      await deleteCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  });
});
