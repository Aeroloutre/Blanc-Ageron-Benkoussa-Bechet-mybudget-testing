import { jest } from '@jest/globals';

// Mocks simplifiés 
const mockCreateTransaction = jest.fn();
const mockCheckBudgetAfterTransaction = jest.fn();

jest.unstable_mockModule('../services/transactions.service.js', () => ({
  createTransaction: mockCreateTransaction
}));

jest.unstable_mockModule('../services/budgets.service.js', () => ({
  checkBudgetAfterTransaction: mockCheckBudgetAfterTransaction
}));

const mockHandleZodError = jest.fn();
jest.unstable_mockModule('../helpers/handleZodError.js', () => ({
  handleZodError: mockHandleZodError
}));

// Import controllers après les mocks
const { createTransaction } = await import('../controllers/transactions.controller.js');

describe('Transactions Controller - Logique alerte sisinou', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = { 
      body: {
        amount: 50,
        label: 'Test transaction',
        type: 'expense',
        category_id: 1,
        transaction_date: '2026-02-10'
      }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('createTransaction avec logique alerte', () => {
    test('créé transaction SANS alerte si budget OK', async () => {
      const mockTransaction = { transaction_id: 1, amount: 50 };
      const mockBudgetCheck = { alert: false, status: 'OK' };
      
      mockCheckBudgetAfterTransaction.mockResolvedValue(mockBudgetCheck);
      mockCreateTransaction.mockResolvedValue(mockTransaction);

      await createTransaction(req, res, next);

      expect(mockCheckBudgetAfterTransaction).toHaveBeenCalledWith(req.body);
      expect(mockCreateTransaction).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        transaction: mockTransaction
      });
    });

    test('créé transaction AVEC alerte si budget dépassé', async () => {
      const mockTransaction = { transaction_id: 1, amount: 50 };
      const mockBudgetCheck = { 
        alert: true, 
        status: 'OVER_BUDGET',
        percent: 110 
      };
      
      mockCheckBudgetAfterTransaction.mockResolvedValue(mockBudgetCheck);
      mockCreateTransaction.mockResolvedValue(mockTransaction);

      await createTransaction(req, res, next);

      expect(mockCheckBudgetAfterTransaction).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        transaction: mockTransaction,
        alert: mockBudgetCheck
      });
    });

    test('créé transaction AVEC alerte si seuil 80% atteint', async () => {
      const mockTransaction = { transaction_id: 1, amount: 50 };
      const mockBudgetCheck = { 
        alert: true, 
        status: 'WARNING',
        percent: 85 
      };
      
      mockCheckBudgetAfterTransaction.mockResolvedValue(mockBudgetCheck);
      mockCreateTransaction.mockResolvedValue(mockTransaction);

      await createTransaction(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        transaction: mockTransaction,
        alert: mockBudgetCheck
      });
    });

    test('gère les erreurs de vérification budget', async () => {
      const error = new Error('Budget check failed');
      mockCheckBudgetAfterTransaction.mockRejectedValue(error);

      await createTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    });

    test('gère les erreurs de création transaction', async () => {
      const mockBudgetCheck = { alert: false };
      const error = new Error('Transaction creation failed');
      
      mockCheckBudgetAfterTransaction.mockResolvedValue(mockBudgetCheck);
      mockCreateTransaction.mockRejectedValue(error);

      await createTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});