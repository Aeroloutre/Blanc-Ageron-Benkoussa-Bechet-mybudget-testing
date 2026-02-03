import { jest } from '@jest/globals';

// Mock du service
const mockDeleteData = jest.fn();
const mockDb = { query: mockQuery, pool: {} };
jest.unstable_mockModule('../services/db.service.js', () => ({
    default: mockDb,  // Export par défaut
    db: mockDb 
}));

// Importer après le mock
const { deleteData } = await import('../controllers/db.controller.js');

describe('deleteData Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des objets request, response, next
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('Devrait retourner un statut 204 après suppression réussie', async () => {
    // Mock du service qui réussit
    mockDeleteData.mockResolvedValue();

    // Appeler le controller
    await deleteData(req, res, next);
    
    // Vérifier que le service a été appelé
    expect(mockDeleteData).toHaveBeenCalledTimes(1);
    
    // Vérifier que la réponse a le bon statut
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    
    // Vérifier que next n'a pas été appelé (pas d'erreur)
    expect(next).not.toHaveBeenCalled();
  });

  test('Devrait appeler next avec l\'erreur en cas d\'échec du service', async () => {
    // Mock du service qui échoue
    const serviceError = new Error('Database error');
    mockDeleteData.mockRejectedValue(serviceError);

    // Appeler le controller
    await deleteData(req, res, next);
    
    // Vérifier que le service a été appelé
    expect(mockDeleteData).toHaveBeenCalledTimes(1);
    
    // Vérifier que next a été appelé avec l'erreur
    expect(next).toHaveBeenCalledWith(serviceError);
    
    // Vérifier que la réponse n'a pas été envoyée
    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});