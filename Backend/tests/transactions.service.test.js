import { createTransaction } from '../services/transactions.service.js';

// modifier la bdd 
const mockDb = {
  execute: jest.fn()
};

//remplacer par la bdd 
jest.mock('../db.js', () => ({
  db: mockDb
}));

describe('Test de createTransaction', () => {
  test('Créer une transaction simple', async () => {
    // donnée a modifier en fonction de la bdd
    const transactionData = {
      montant: 50,
      libelle: 'Café',
      type: 'depense',
      date: '2026-01-06',
      id_categorie: 1
    };

    // reponse a modifier
    mockDb.execute.mockResolvedValue([{ insertId: 123 }]);

    // test de la fonction
    const result = await createTransaction(transactionData);
    
    expect(result.id).toBe(123);
    expect(result.montant).toBe(50);
    expect(result.libelle).toBe('Café');
  });
});