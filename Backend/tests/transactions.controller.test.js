import { jest } from '@jest/globals';

const mockCreateTransaction = jest.fn();
const mockGetTransactions = jest.fn();
const mockGetTransactionById = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();
const mockCheckBudgetAfterTransaction = jest.fn();

jest.unstable_mockModule('../services/transactions.service.js', () => ({
  createTransaction: mockCreateTransaction,
  getTransactions: mockGetTransactions,
  getTransactionById: mockGetTransactionById,
  updateTransaction: mockUpdateTransaction,
  deleteTransaction: mockDeleteTransaction
}));

jest.unstable_mockModule('../services/budgets.service.js', () => ({
  checkBudgetAfterTransaction: mockCheckBudgetAfterTransaction
}));

const mockHandleZodError = jest.fn();
jest.unstable_mockModule('../helpers/handleZodError.js', () => ({
  handleZodError: mockHandleZodError
}));

const { 
  createTransaction, 
  getTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction 
} = await import('../controllers/transactions.controller.js');

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
      },
      params: {},
      query: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
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

  describe('getTransactions', () => {
    test('retourne toutes les transactions sans filtre', async () => {
      const mockTransactions = [
        { transaction_id: 1, amount: 50, type: 'expense' },
        { transaction_id: 2, amount: 100, type: 'income' }
      ];
      req.query = {};
      mockGetTransactions.mockResolvedValue(mockTransactions);

      await getTransactions(req, res, next);

      expect(mockGetTransactions).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    test('retourne les transactions avec filtres', async () => {
      const mockTransactions = [{ transaction_id: 1, amount: 50, type: 'expense' }];
      req.query = { type: 'expense', limit: '10' };
      mockGetTransactions.mockResolvedValue(mockTransactions);

      await getTransactions(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });
  });

  describe('getTransactionById', () => {
    test('retourne une transaction existante', async () => {
      const mockTransaction = { transaction_id: 1, amount: 50, type: 'expense' };
      req.params = { id: '1' };
      mockGetTransactionById.mockResolvedValue(mockTransaction);

      await getTransactionById(req, res, next);

      expect(mockGetTransactionById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    test('retourne 404 si transaction inexistante', async () => {
      req.params = { id: '999' };
      mockGetTransactionById.mockResolvedValue(null);

      await getTransactionById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Transaction introuvable' });
    });

    test('appelle next en cas d\'erreur', async () => {
      const error = new Error('DB Error');
      req.params = { id: '1' };
      mockGetTransactionById.mockRejectedValue(error);

      await getTransactionById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTransaction', () => {
    test('met à jour une transaction existante', async () => {
      const mockTransaction = { transaction_id: 1, amount: 75, type: 'expense' };
      req.params = { id: '1' };
      req.body = { amount: 75 };
      mockUpdateTransaction.mockResolvedValue(mockTransaction);

      await updateTransaction(req, res, next);

      expect(mockUpdateTransaction).toHaveBeenCalledWith(1, { amount: 75 });
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    test('retourne 404 si transaction inexistante', async () => {
      req.params = { id: '999' };
      req.body = { amount: 75 };
      mockUpdateTransaction.mockResolvedValue(null);

      await updateTransaction(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Transaction introuvable' });
    });

    test('appelle next en cas d\'erreur', async () => {
      const error = new Error('DB Error');
      req.params = { id: '1' };
      req.body = { amount: 75 };
      mockUpdateTransaction.mockRejectedValue(error);

      await updateTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteTransaction', () => {
    test('supprime une transaction existante', async () => {
      req.params = { id: '1' };
      mockDeleteTransaction.mockResolvedValue(true);

      await deleteTransaction(req, res, next);

      expect(mockDeleteTransaction).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  });
});