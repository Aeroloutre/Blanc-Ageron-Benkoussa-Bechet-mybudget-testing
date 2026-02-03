import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db.js', () => ({ db: { query: mockQuery } }));
const { createTransaction } = await import('../services/transactions.service.js');

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

    mockQuery.mockResolvedValue({ 
      rows: [{ transaction_id: 123, amount: 50.00, label: 'Café', type: 'expense', transaction_date: '2026-01-06', category_id: 1 }] 
    });

    const result = await createTransaction(transactionData);
    
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO transactions'),
      [50.00, 'Café', 'expense', '2026-01-06', 1]
    );
    expect(result.transaction_id).toBe(123);
    expect(result.amount).toBe(50.00);
  });
});
