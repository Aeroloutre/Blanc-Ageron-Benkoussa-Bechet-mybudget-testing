import { jest } from '@jest/globals';

// Mock db AVANT d'importer le service
const mockExecute = jest.fn();
jest.unstable_mockModule('../db.js', () => ({
  db: { execute: mockExecute }
}));

// Importer après le mock
const { getTransactionsByPeriod } = await import('../services/transaction.service.js');

describe('getAllTransactions', () => {
  beforeEach(() => { // permet de faire plusieur test dans le meme fichier
    jest.clearAllMocks(); // clear les appel precedent pour les mocks 
  });

  test('Récupérer toutes les transactions sans filtre', async () => {
    const mockTransactions = [
      { id: 1, montant: 50.00, type: 'expense' },
      { id: 2, montant: 2500.00, type: 'income' },
      { id: 3, montant: 30.00, type: 'expense' }
    ];

    mockExecute.mockResolvedValue([mockTransactions]);//
    //simule une reponse comme const [rows] = await db.execute('select * from transactions');

    const result = await getTransactionsByPeriod({});

    expect(mockExecute).toHaveBeenCalledWith(
      'SELECT * FROM transactions WHERE 1=1',
      []
    );
    expect(result.length).toBe(3);
  });
});
