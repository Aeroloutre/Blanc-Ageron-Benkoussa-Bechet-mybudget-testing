import { jest } from '@jest/globals';

// Mock db AVANT d'importer le service
const mockQuery = jest.fn();
jest.unstable_mockModule('../db.js', () => ({
  db: { query: mockQuery }
}));

// Importer après le mock
const { getTransactions } = await import('../services/transactions.service.js');

describe('getTransactionsByPeriod', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Récupérer les transactions par période', async () => {
    const mockTransactions = [
      { id: 1, montant: 50.00, type: 'expense' },
      { id: 2, montant: 100.00, type: 'expense' }
    ];

    mockQuery.mockResolvedValue({ rows: mockTransactions });

    const result = await getTransactions({ 
      date_after: '2026-01-01', 
      date_before: '2026-01-07' 
    });

    expect(mockQuery).toHaveBeenCalled();
    expect(result).toEqual(mockTransactions);
  });
});
