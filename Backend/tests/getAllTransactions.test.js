import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db.js', () => ({ db: { query: mockQuery } }));
const { getTransactions } = await import('../services/transactions.service.js');

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

    mockQuery.mockResolvedValue({ rows: mockTransactions });
    //simule une reponse comme const { rows } = await db.query('select * from transactions');

    const result = await getTransactions({});

    expect(mockQuery).toHaveBeenCalled();
    expect(result.length).toBe(3);
  });
});
