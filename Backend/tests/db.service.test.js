import { jest } from '@jest/globals';

// Mock db AVANT d'importer le service
const mockQuery = jest.fn();
const mockDb = { query: mockQuery, pool: {} };
jest.unstable_mockModule('../db.js', () => ({
    default: mockDb,  // Export par défaut
    db: mockDb 
}));

// Importer après le mock
const { deleteData } = await import('../services/db.service.js');

describe('deleteData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait supprimer toutes les données de toutes les tables', async () => {
    // Mock de la réponse de la base de données
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    // Appeler la fonction
    await deleteData();
    
    // Vérifier que la requête SQL a été appelée
    expect(mockQuery).toHaveBeenCalledTimes(1);
    
    // Vérifier que la requête contient bien TRUNCATE
    const sqlQuery = mockQuery.mock.calls[0][0];
    expect(sqlQuery).toContain('TRUNCATE TABLE');
    expect(sqlQuery).toContain('RESTART IDENTITY CASCADE');
    expect(sqlQuery).toContain('pg_tables');
    expect(sqlQuery).toContain("schemaname = 'public'");
  });

  test('Devrait propager les erreurs de la base de données', async () => {
    // Mock d'une erreur
    const dbError = new Error('Database connection failed');
    mockQuery.mockRejectedValue(dbError);

    // Vérifier que l'erreur est propagée
    await expect(deleteData()).rejects.toThrow('Database connection failed');
    
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});