import { createTransaction } from '../Services/transactions.service.js';

// Mock de la base de données PostgreSQL
const mockDb = {
  execute: jest.fn()
};

// Remplace la vraie DB par notre mock
jest.mock('../db.js', () => ({
  db: mockDb
}));

describe('Test de createTransaction - PostgreSQL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Créer une transaction expense simple', async () => {
    // Données conformes au schéma PostgreSQL
    const transactionData = {
      montant: 50.00,      
      libelle: 'Café',     
      type: 'expense',     
      date: '2026-01-06',  
      id_categorie: 1      
    };

    // Mock de la réponse PostgreSQL (insertId devient différent)
    mockDb.execute.mockResolvedValue([{ 
      transaction_id: 123,     
      amount: 50.00,
      label: 'Café',
      type: 'expense',
      transaction_date: '2026-01-06',
      category_id: 1,
      created_at: '2026-01-06T10:00:00Z',
      updated_at: '2026-01-06T10:00:00Z'
    }]);

    const result = await createTransaction(transactionData);
    
    expect(mockDb.execute).toHaveBeenCalledWith(
      'INSERT INTO transactions (amount, label, type, transaction_date, category_id) VALUES (?, ?, ?, ?, ?)',
      [50.00, 'Café', 'expense', '2026-01-06', 1]
    );

    expect(result.id).toBe(123);
    expect(result.montant).toBe(50.00);
    expect(result.libelle).toBe('Café');
    expect(result.type).toBe('expense');
  });

  test('Créer une transaction income', async () => {
    const transactionData = {
      montant: 2500.00,
      libelle: 'Salaire',
      type: 'income',      
      date: '2026-01-06',
      id_categorie: 5      
    };

    mockDb.execute.mockResolvedValue([{ 
      transaction_id: 124,
      amount: 2500.00,
      label: 'Salaire',
      type: 'income',
      transaction_date: '2026-01-06',
      category_id: 5
    }]);

    const result = await createTransaction(transactionData);
    
    expect(result.id).toBe(124);
    expect(result.type).toBe('income');
    expect(result.montant).toBe(2500.00);
  });

  test('Vérifier que les contraintes sont respectées', async () => {
    const transactionData = {
      montant: 25.99,           
      libelle: 'Course alimentaire',
      type: 'expense',          
      date: '2026-01-06',
      id_categorie: 4          
    };

    mockDb.execute.mockResolvedValue([{ 
      transaction_id: 125,
      amount: 25.99,
      label: 'Course alimentaire',
      type: 'expense',
      category_id: 4
    }]);

    const result = await createTransaction(transactionData);
    
    expect(result.montant).toBeGreaterThan(0);  
    expect(['income', 'expense']).toContain(result.type); 
  });
});