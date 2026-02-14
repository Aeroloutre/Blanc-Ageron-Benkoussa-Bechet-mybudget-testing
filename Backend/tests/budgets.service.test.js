import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockDb = { query: mockQuery };

jest.unstable_mockModule('../db.js', () => ({
  db: mockDb
}));

const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  createBudgetWithRollover
} = await import('../services/budgets.service.js');

describe('Budgets Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBudgets', () => {
    test('retourne tous les budgets', async () => {
      const mockBudgets = [
        { budget_id: 1, category_label: 'Alimentation', allocated_amount: 300 }
      ];
      mockQuery.mockResolvedValue({ rows: mockBudgets });

      const result = await getBudgets();

      expect(result).toEqual(mockBudgets);
    });
  });

  describe('getBudgetById', () => {
    test('retourne un budget par son ID', async () => {
      const mockBudget = { budget_id: 1, allocated_amount: 300 };
      mockQuery.mockResolvedValue({ rows: [mockBudget] });

      const result = await getBudgetById(1);

      expect(result).toEqual(mockBudget);
    });
  });

  describe('createBudget', () => {
    test('crée un budget', async () => {
      const newBudget = {
        category_id: 1,
        allocated_amount: 300,
        period_start: '2026-02-01',
        period_end: '2026-02-28'
      };
      const mockCreated = { budget_id: 1, ...newBudget };
      mockQuery.mockResolvedValue({ rows: [mockCreated] });

      const result = await createBudget(newBudget);

      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateBudget', () => {
    test('met à jour un budget', async () => {
      const updates = { allocated_amount: 350 };
      const mockUpdated = { budget_id: 1, allocated_amount: 350 };
      mockQuery.mockResolvedValue({ rows: [mockUpdated] });

      const result = await updateBudget(1, updates);

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteBudget', () => {
    test('supprime un budget', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await deleteBudget(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM budgets WHERE budget_id = $1',
        [1]
      );
    });
  });

  describe('createBudgetWithRollover', () => {
    test('crée budget avec rollover positif', async () => {
      const budgetData = {
        category_id: 1,
        allocated_amount: 300,
        period_start: '2026-02-01',
        period_end: '2026-02-28'
      };

      mockQuery
        .mockResolvedValueOnce({ 
          rows: [{ allocated_amount: '200', spent: '150' }]
        })
        .mockResolvedValueOnce({ 
          rows: [{ budget_id: 1, allocated_amount: 350 }]
        });

      const result = await createBudgetWithRollover(budgetData);

      expect(result.rollover).toBe(50);
      expect(result.allocated_amount).toBe(350);
    });
  });
});
