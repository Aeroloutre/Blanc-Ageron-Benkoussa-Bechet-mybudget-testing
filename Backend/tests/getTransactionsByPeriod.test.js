import { jest } from '@jest/globals';

// Mock db AVANT d'importer le service
const mockExecute = jest.fn();
jest.unstable_mockModule('../db.js', () => ({
  db: { execute: mockExecute }
}));

// Importer après le mock
const { getTransactionsByPeriod } = await import('../services/transaction.service.js');

describe('getTransactionsByPeriod', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Récupérer les transactions par période', async () => {
    const mockTransactions = [
      { id: 1, montant: 50.00, type: 'expense' },
      { id: 2, montant: 100.00, type: 'expense' }
    ];

    mockExecute.mockResolvedValue([mockTransactions]);

    const result = await getTransactionsByPeriod({ 
      date_after: '2026-01-01', 
      date_before: '2026-01-07' 
    });

    expect(mockExecute).toHaveBeenCalled();
    expect(result).toEqual(mockTransactions);
  });
});
