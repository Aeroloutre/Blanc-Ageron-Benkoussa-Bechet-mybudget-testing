import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db.js', () => ({ 
  db: { query: mockQuery } 
}));

const { 
  getCategories,
  getCategoriesById,
  createCategory,
  updateCategory,
  deleteCategory
} = await import('../services/categories.service.js');

const MOCK_CATEGORIES = {
  basic: [
    { category_id: 1, label: 'Alimentation' },
    { category_id: 2, label: 'Salaire' },
    { category_id: 3, label: 'Transport' },
    { category_id: 4, label: 'Loisirs' }
  ],
  single: { category_id: 1, label: 'Alimentation' },
  new: { label: 'Nouvelle catégorie' },
  created: { category_id: 5, label: 'Nouvelle catégorie' },
  updated: { category_id: 1, label: 'Alimentation mise à jour' }
};

describe('CategoriesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DataRetrieval - Cas de succès', () => {
    class DataRetrievalSuccessTests {
      static async testGetAllCategories() {
        // Arrange
        mockQuery.mockResolvedValue({ rows: MOCK_CATEGORIES.basic });

        // Act
        const result = await getCategories();

        // Assert
        expect(mockQuery).toHaveBeenCalledWith(
          "SELECT * FROM categories ORDER BY label"
        );
        expect(result).toEqual(MOCK_CATEGORIES.basic);
        expect(result.length).toBe(4);
      }

      static async testGetCategoryById() {
        // Arrange
        const categoryId = 1;
        mockQuery.mockResolvedValue({ rows: [MOCK_CATEGORIES.single] });

        // Act
        const result = await getCategoriesById(categoryId);

        // Assert
        expect(mockQuery).toHaveBeenCalledWith(
          "SELECT * FROM categories WHERE category_id = $1",
          [categoryId]
        );
        expect(result).toEqual(MOCK_CATEGORIES.single);
        expect(result.category_id).toBe(categoryId);
      }

      static async testGetCategoriesOrderedByLabel() {
        // Arrange
        const sortedCategories = [
          { category_id: 1, label: 'Alimentation' },
          { category_id: 4, label: 'Loisirs' },
          { category_id: 2, label: 'Salaire' },
          { category_id: 3, label: 'Transport' }
        ];
        mockQuery.mockResolvedValue({ rows: sortedCategories });

        // Act
        const result = await getCategories();

        // Assert
        expect(result[0].label).toBe('Alimentation');
        expect(result[1].label).toBe('Loisirs');
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY label')
        );
      }
    }

    test('Récupérer toutes les catégories', async () => {
      await DataRetrievalSuccessTests.testGetAllCategories();
    });

    test('Récupérer une catégorie par ID', async () => {
      await DataRetrievalSuccessTests.testGetCategoryById();
    });

    test('Vérifier l\'ordre alphabétique des catégories', async () => {
      await DataRetrievalSuccessTests.testGetCategoriesOrderedByLabel();
    });
  });

  /**
   * Classe pour les tests de création de données (cas de succès)
   */
  describe('DataCreation - Cas de succès', () => {
    class DataCreationSuccessTests {
      static async testCreateCategory() {
        // Arrange
        const categoryData = MOCK_CATEGORIES.new;
        const expectedResult = MOCK_CATEGORIES.created;
        
        mockQuery.mockResolvedValue({ 
          rows: [expectedResult] 
        });

        // Act
        const result = await createCategory(categoryData);
        
        // Assert
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO categories'),
          [categoryData.label]
        );
        expect(result.category_id).toBe(expectedResult.category_id);
        expect(result.label).toBe(expectedResult.label);
      }

      static async testCreateCategoryWithSpecialCharacters() {
        // Arrange
        const specialCategoryData = { label: 'Café & Restaurant' };
        const expectedResult = { category_id: 6, label: 'Café & Restaurant' };
        
        mockQuery.mockResolvedValue({ rows: [expectedResult] });

        // Act
        const result = await createCategory(specialCategoryData);
        
        // Assert
        expect(result.label).toBe('Café & Restaurant');
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO categories'),
          ['Café & Restaurant']
        );
      }
    }

    test('Créer une nouvelle catégorie', async () => {
      await DataCreationSuccessTests.testCreateCategory();
    });

    test('Créer une catégorie avec caractères spéciaux', async () => {
      await DataCreationSuccessTests.testCreateCategoryWithSpecialCharacters();
    });
  });

  /**
   * Classe pour les tests de mise à jour (cas de succès)
   */
  describe('DataUpdate - Cas de succès', () => {
    class DataUpdateSuccessTests {
      static async testUpdateCategory() {
        // Arrange
        const categoryId = 1;
        const updateData = { label: 'Alimentation mise à jour' };
        const expectedResult = MOCK_CATEGORIES.updated;
        
        mockQuery.mockResolvedValue({ rows: [expectedResult] });

        // Act
        const result = await updateCategory(categoryId, updateData);
        
        // Assert
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE categories'),
          [categoryId, updateData.label]
        );
        expect(result.category_id).toBe(categoryId);
        expect(result.label).toBe(updateData.label);
      }

      static async testUpdateCategoryPartialData() {
        // Arrange
        const categoryId = 1;
        const partialData = { label: 'Nouveau nom' };
        const expectedResult = { category_id: 1, label: 'Nouveau nom' };
        
        mockQuery.mockResolvedValue({ rows: [expectedResult] });

        // Act
        const result = await updateCategory(categoryId, partialData);
        
        // Assert
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('COALESCE'),
          [categoryId, partialData.label]
        );
        expect(result.label).toBe('Nouveau nom');
      }
    }

    test('Mettre à jour une catégorie', async () => {
      await DataUpdateSuccessTests.testUpdateCategory();
    });

    test('Mise à jour partielle d\'une catégorie', async () => {
      await DataUpdateSuccessTests.testUpdateCategoryPartialData();
    });
  });

  /**
   * Classe pour les tests de suppression (cas de succès)
   */
  describe('DataDeletion - Cas de succès', () => {
    class DataDeletionSuccessTests {
      static async testDeleteCategory() {
        // Arrange
        const categoryId = 1;
        mockQuery.mockResolvedValue({ rowCount: 1 });

        // Act
        await deleteCategory(categoryId);
        
        // Assert
        expect(mockQuery).toHaveBeenCalledWith(
          "DELETE FROM categories WHERE category_id = $1",
          [categoryId]
        );
      }

      static async testDeleteMultipleCategories() {
        const categoryIds = [1, 2, 3];
        mockQuery.mockResolvedValue({ rowCount: 1 });

        for (const id of categoryIds) {
          await deleteCategory(id);
        }
        
        expect(mockQuery).toHaveBeenCalledTimes(3);
        categoryIds.forEach((id, index) => {
          expect(mockQuery).toHaveBeenNthCalledWith(
            index + 1,
            "DELETE FROM categories WHERE category_id = $1",
            [id]
          );
        });
      }
    }

    test('Supprimer une catégorie', async () => {
      await DataDeletionSuccessTests.testDeleteCategory();
    });

    test('Supprimer plusieurs catégories', async () => {
      await DataDeletionSuccessTests.testDeleteMultipleCategories();
    });
  });

  /**
   * Classe pour les tests d'erreurs et d'exceptions
   */
  describe('ErrorHandling - Gestion des erreurs', () => {
    class ErrorHandlingTests {
      static async testDatabaseConnectionError() {
        const dbError = new Error('Connection refused');
        mockQuery.mockRejectedValue(dbError);

        await expect(getCategories()).rejects.toThrow('Connection refused');
        expect(mockQuery).toHaveBeenCalled();
      }

      static async testCategoryNotFound() {
        const nonExistentId = 999;
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await getCategoriesById(nonExistentId);

        expect(result).toBeUndefined();
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('WHERE category_id = $1'),
          [nonExistentId]
        );
      }

      static async testCreateCategoryWithEmptyLabel() {
        const invalidData = { label: '' };
        const dbError = new Error('Label cannot be empty');
        mockQuery.mockRejectedValue(dbError);

        await expect(createCategory(invalidData)).rejects.toThrow('Label cannot be empty');
      }

      static async testUpdateNonExistentCategory() {
        const nonExistentId = 999;
        const updateData = { label: 'Nouveau nom' };
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await updateCategory(nonExistentId, updateData);

        expect(result).toBeUndefined();
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE categories'),
          [nonExistentId, updateData.label]
        );
      }

      static async testDeleteNonExistentCategory() {
        const nonExistentId = 999;
        mockQuery.mockResolvedValue({ rowCount: 0 });
        await deleteCategory(nonExistentId);

        expect(mockQuery).toHaveBeenCalledWith(
          "DELETE FROM categories WHERE category_id = $1",
          [nonExistentId]
        );
      }
    }

    test('Erreur de connexion à la base de données', async () => {
      await ErrorHandlingTests.testDatabaseConnectionError();
    });

    test('Catégorie non trouvée par ID', async () => {
      await ErrorHandlingTests.testCategoryNotFound();
    });

    test('Créer une catégorie avec label vide', async () => {
      await ErrorHandlingTests.testCreateCategoryWithEmptyLabel();
    });

    test('Mettre à jour une catégorie inexistante', async () => {
      await ErrorHandlingTests.testUpdateNonExistentCategory();
    });

    test('Supprimer une catégorie inexistante', async () => {
      await ErrorHandlingTests.testDeleteNonExistentCategory();
    });
  });

  /**
   * Classe pour les tests de validation des données
   */
  describe('DataValidation - Validation des données', () => {
    class DataValidationTests {
      static async testCategoryDataTypes() {
        mockQuery.mockResolvedValue({ rows: MOCK_CATEGORIES.basic });

        const result = await getCategories();

        result.forEach(category => {
          expect(typeof category.category_id).toBe('number');
          expect(typeof category.label).toBe('string');
          expect(category.label.length).toBeGreaterThan(0);
        });
      }

      static async testCategoryLabelValidation() {
        const categoryData = { label: 'Test Catégorie' };
        const expectedResult = { category_id: 1, label: 'Test Catégorie' };
        mockQuery.mockResolvedValue({ rows: [expectedResult] });
        const result = await createCategory(categoryData);

        expect(result.label).toBe(categoryData.label);
        expect(result.label).toMatch(/^[A-Za-z0-9À-ÿ\s&]+$/); // Validation format
      }

      static async testCategoryIdValidation() {
        const validId = 1;
        mockQuery.mockResolvedValue({ rows: [MOCK_CATEGORIES.single] });
        const result = await getCategoriesById(validId);
        expect(result.category_id).toBe(validId);
        expect(Number.isInteger(result.category_id)).toBe(true);
        expect(result.category_id).toBeGreaterThan(0);
      }
    }

    test('Validation des types de données des catégories', async () => {
      await DataValidationTests.testCategoryDataTypes();
    });

    test('Validation du format des labels', async () => {
      await DataValidationTests.testCategoryLabelValidation();
    });

    test('Validation des IDs de catégorie', async () => {
      await DataValidationTests.testCategoryIdValidation();
    });
  });
});