import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db.js', () => ({ 
  db: { query: mockQuery } 
}));

const { 
  getTransactions, 
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} = await import('../services/transactions.service.js');

const MOCK_TRANSACTIONS = {
  standard: [
    { id: 1, montant: 50.00, type: 'expense' },
    { id: 2, montant: 2500.00, type: 'income' },
    { id: 3, montant: 30.00, type: 'expense' }
  ],
  filtered: [
    { id: 1, montant: 50.00, type: 'expense', transaction_date: '2026-01-06' },
    { id: 2, montant: 100.00, type: 'expense', transaction_date: '2026-01-05' }
  ]
};

const MOCK_TRANSACTION_DATA = {
  valid: {
    amount: 50.00,
    label: 'Café',
    type: 'expense',
    transaction_date: '2026-01-06',
    category_id: 1
  },
  created: {
    transaction_id: 123,
    amount: 50.00,
    label: 'Café',
    type: 'expense',
    transaction_date: '2026-01-06',
    category_id: 1
  },
  single: {
    transaction_id: 1,
    amount: 50.00,
    label: 'Café du matin',
    type: 'expense',
    transaction_date: '2026-01-06',
    category_id: 1
  },
  updated: {
    transaction_id: 1,
    amount: 75.00,
    label: 'Café mis à jour',
    type: 'expense',
    transaction_date: '2026-01-07',
    category_id: 2
  }
};

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DataRetrieval', () => {
    test('Récupérer toutes les transactions sans filtre', async () => {
      mockQuery.mockResolvedValue({ rows: MOCK_TRANSACTIONS.standard });

      const result = await getTransactions({});

      expect(mockQuery).toHaveBeenCalled();
      expect(result.length).toBe(3);
      expect(result).toEqual(MOCK_TRANSACTIONS.standard);
    });

    test('Récupérer les transactions par période', async () => {
      const filters = { 
        date_after: '2026-01-01', 
        date_before: '2026-01-07' 
      };
      mockQuery.mockResolvedValue({ rows: MOCK_TRANSACTIONS.filtered });

      const result = await getTransactions(filters);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(MOCK_TRANSACTIONS.filtered);
    });

    test('Récupérer une transaction par ID', async () => {
      const transactionId = 1;
      mockQuery.mockResolvedValue({ rows: [MOCK_TRANSACTION_DATA.single] });

      const result = await getTransactionById(transactionId);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM transactions WHERE transaction_id = $1",
        [transactionId]
      );
      expect(result).toEqual(MOCK_TRANSACTION_DATA.single);
      expect(result.transaction_id).toBe(transactionId);
    });
  });

  describe('DataCreation', () => {
    test('Créer une transaction', async () => {
      const transactionData = MOCK_TRANSACTION_DATA.valid;
      const expectedResult = MOCK_TRANSACTION_DATA.created;
      
      mockQuery.mockResolvedValue({ 
        rows: [expectedResult] 
      });

      const result = await createTransaction(transactionData);
      
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transactions'),
        [
          transactionData.amount,
          transactionData.label,
          transactionData.type,
          transactionData.transaction_date,
          transactionData.category_id
        ]
      );
      expect(result.transaction_id).toBe(expectedResult.transaction_id);
      expect(result.amount).toBe(expectedResult.amount);
      expect(result.label).toBe(expectedResult.label);
    });
  });

  describe('DataUpdate', () => {
    test('Mettre à jour une transaction', async () => {
      const transactionId = 1;
      const updateData = {
        amount: 75.00,
        label: 'Café mis à jour',
        type: 'expense',
        transaction_date: '2026-01-07',
        category_id: 2
      };
      const expectedResult = MOCK_TRANSACTION_DATA.updated;
      
      mockQuery.mockResolvedValue({ rows: [expectedResult] });

      const result = await updateTransaction(transactionId, updateData);
      
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE transactions'),
        [
          transactionId,
          updateData.amount,
          updateData.label,
          updateData.type,
          updateData.transaction_date,
          updateData.category_id
        ]
      );
      expect(result.transaction_id).toBe(transactionId);
      expect(result.amount).toBe(updateData.amount);
    });

    test('Mise à jour partielle d\'une transaction', async () => {
      const transactionId = 1;
      const partialData = { amount: 60.00 };
      const expectedResult = { 
        ...MOCK_TRANSACTION_DATA.single, 
        amount: 60.00 
      };
      
      mockQuery.mockResolvedValue({ rows: [expectedResult] });

      const result = await updateTransaction(transactionId, partialData);
      
      expect(result.amount).toBe(60.00);
      expect(result.label).toBe(MOCK_TRANSACTION_DATA.single.label);
    });
  });

  describe('DataDeletion', () => {
    test('Supprimer une transaction', async () => {
      const transactionId = 1;
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await deleteTransaction(transactionId);
      
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM transactions WHERE transaction_id = $1",
        [transactionId]
      );
      expect(result).toBe(true);
    });

    test('Supprimer une transaction inexistante', async () => {
      const transactionId = 999;
      mockQuery.mockResolvedValue({ rowCount: 0 });

      const result = await deleteTransaction(transactionId);
      
      expect(result).toBe(false);
    });
  });

  describe('ErrorHandling', () => {
    test('Erreur de connexion à la base de données', async () => {
      const dbError = new Error('Connection refused');
      mockQuery.mockRejectedValue(dbError);

      await expect(getTransactions({})).rejects.toThrow('Connection refused');
      expect(mockQuery).toHaveBeenCalled();
    });

    test('Créer une transaction avec des données invalides', async () => {
      const invalidTransactionData = {
        amount: -50.00,
        label: '',
        type: 'invalid_type',
        transaction_date: 'invalid_date',
        category_id: null
      };
      
      const dbError = new Error('Invalid data constraint violation');
      mockQuery.mockRejectedValue(dbError);

      await expect(createTransaction(invalidTransactionData)).rejects.toThrow('Invalid data constraint violation');
    });

    test('Transaction non trouvée par ID', async () => {
      const nonExistentId = 999;
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await getTransactionById(nonExistentId);

      expect(result).toBeUndefined();
    });

    test('Mise à jour d\'une transaction inexistante', async () => {
      const nonExistentId = 999;
      const updateData = { amount: 100.00 };
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await updateTransaction(nonExistentId, updateData);

      expect(result).toBeUndefined();
    });
  });

  describe('DataValidation', () => {
    test('Validation des types de données des transactions', async () => {
      const transactionData = MOCK_TRANSACTION_DATA.valid;
      mockQuery.mockResolvedValue({ rows: [MOCK_TRANSACTION_DATA.created] });

      const result = await createTransaction(transactionData);

      expect(typeof result.transaction_id).toBe('number');
      expect(typeof result.amount).toBe('number');
      expect(typeof result.label).toBe('string');
      expect(typeof result.type).toBe('string');
      expect(typeof result.category_id).toBe('number');
    });

    test('Validation du format des dates', async () => {
      const filters = { 
        date_after: '2026-01-01', 
        date_before: '2026-01-07' 
      };
      mockQuery.mockResolvedValue({ rows: MOCK_TRANSACTIONS.filtered });

      const result = await getTransactions(filters);

      result.forEach(transaction => {
        expect(transaction.transaction_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });
});