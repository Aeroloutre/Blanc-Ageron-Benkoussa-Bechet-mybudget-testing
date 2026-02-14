import { jest } from '@jest/globals';

// Mocks simplifiés - on mock directement les controllers sans passer par Zod
const mockGetBudgetAlerts = jest.fn();
const mockCreateBudgetWithRollover = jest.fn();

// Mock seulement les services, pas Zod
jest.unstable_mockModule('../services/budgets.service.js', () => ({
  getBudgetAlerts: mockGetBudgetAlerts,
  createBudgetWithRollover: mockCreateBudgetWithRollover
}));

// Mock de handleZodError au cas où
const mockHandleZodError = jest.fn();
jest.unstable_mockModule('../helpers/handleZodError.js', () => ({
  handleZodError: mockHandleZodError
}));

// Import controllers après les mocks
const { getBudgetAlerts, createBudgetWithRollover } = await import('../controllers/budgets.controller.js');

describe('Budgets Controller - Code sisinou', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = { body: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('getBudgetAlerts', () => {
    test('retourne les alertes avec count', async () => {
      const mockAlerts = [
        { budget_id: 1, status: 'WARNING' },
        { budget_id: 2, status: 'OVER_BUDGET' }
      ];
      mockGetBudgetAlerts.mockResolvedValue(mockAlerts);

      await getBudgetAlerts(req, res, next);

      expect(mockGetBudgetAlerts).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        alerts: mockAlerts,
        count: 2
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('gère les erreurs service', async () => {
      const error = new Error('Database error');
      mockGetBudgetAlerts.mockRejectedValue(error);

      await getBudgetAlerts(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('createBudgetWithRollover', () => {
    test('crée budget avec rollover avec données valides', async () => {
      const budgetData = {
        category_id: 1,
        allocated_amount: 300,
        period_start: '2026-02-01',
        period_end: '2026-02-28'
      };
      const mockBudget = { budget_id: 1, ...budgetData, rollover: 50 };
      
      req.body = budgetData;
      mockCreateBudgetWithRollover.mockResolvedValue(mockBudget);

      await createBudgetWithRollover(req, res, next);

      expect(mockCreateBudgetWithRollover).toHaveBeenCalledWith(budgetData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBudget);
    });

    test('gère les erreurs service', async () => {
      const error = new Error('Service error');
      mockCreateBudgetWithRollover.mockRejectedValue(error);
      
      req.body = {
        category_id: 1,
        allocated_amount: 300,
        period_start: '2026-02-01', 
        period_end: '2026-02-28'
      };

      await createBudgetWithRollover(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});