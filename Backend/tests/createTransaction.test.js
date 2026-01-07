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
      montant: 50.00,
      libelle: 'Café',
      type: 'expense',
      date: '2026-01-06',
      id_categorie: 1
    };

    mockExecute.mockResolvedValue([{ insertId: 123 }]);

    const result = await createTransaction(transactionData);
    
    expect(mockExecute).toHaveBeenCalledWith(//verifie qye la fonctiona a ete apelle avec les bon argument 
      'INSERT INTO transactions (montant, libelle, type, date, id_categorie) VALUES (?, ?, ?, ?, ?)',
      [50.00, 'Café', 'expense', '2026-01-06', 1]
    );
    expect(result.id).toBe(123);
    expect(result.montant).toBe(50.00);
  });
});
