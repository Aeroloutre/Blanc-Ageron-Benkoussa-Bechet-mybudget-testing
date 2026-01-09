import { jest } from '@jest/globals';

// Mock db AVANT d'importer le service
const mockExecute = jest.fn();
jest.unstable_mockModule('../db.js', () => ({
  db: { execute: mockExecute }
}));

// Importer apres le mock
const { createTransaction } = await import('../services/transaction.service.js');

describe('createTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Créer une transaction', async () => {
    const transactionData = {
      "amount" : 50.00,
      "label" : "Café",
      "type" : "expense",
      "transaction_date" : "2026-01-06",
      "category_id" : 1
    };

    mockExecute.mockResolvedValue([{ insertId: 123 }]);

    const result = await createTransaction(transactionData);
    
    expect(mockExecute).toHaveBeenCalledWith(//verifie qye la fonctiona a ete apelle avec les bon argument 
      'INSERT INTO transactions (amount, label, type, transaction_date, category_id) VALUES (?, ?, ?, ?, ?)',
      [50.00, 'Café', 'expense', '2026-01-06', 1]
    );
    expect(result.id).toBe(123);
    expect(result.montant).toBe(50.00);
  });
});
