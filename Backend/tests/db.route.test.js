import { jest } from '@jest/globals';
import request from 'supertest';

// Mock db AVANT d'importer l'app
const mockQuery = jest.fn();
const mockDb = { query: mockQuery, pool: {} };
jest.unstable_mockModule('../db.js', () => ({
  default: mockDb,  // Export par défaut
  db: mockDb 
}));

// Importer l'app après le mock
const { default: app } = await import('../app.js');

describe('DELETE /database/delete-data - Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait retourner 204 et supprimer toutes les données', async () => {
    // Mock de la réponse de la base de données
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    // Faire la requête HTTP
    const response = await request(app)
      .delete('/database/delete-data');
    
    // Vérifier le statut de la réponse
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    
    // Vérifier que la requête SQL a été exécutée
    expect(mockQuery).toHaveBeenCalledTimes(1);
    
    const sqlQuery = mockQuery.mock.calls[0][0];
    expect(sqlQuery).toContain('TRUNCATE TABLE');
    expect(sqlQuery).toContain('pg_tables');
  });

  test('Devrait retourner 500 en cas d\'erreur de base de données', async () => {
    // Mock d'une erreur de base de données
    mockQuery.mockRejectedValue(new Error('Database connection failed'));

    // Faire la requête HTTP
    const response = await request(app)
      .delete('/database/delete-data');
    
    // Vérifier que le middleware d'erreur a bien géré l'erreur
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Erreur serveur');
  });

  test('Devrait accepter les requêtes avec CORS', async () => {
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const response = await request(app)
      .delete('/database/delete-data')
      .set('Origin', 'http://localhost:4200');
    
    // Vérifier les headers CORS
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});