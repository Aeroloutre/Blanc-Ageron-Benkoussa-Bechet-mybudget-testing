import { jest } from '@jest/globals';

const mockDeleteData = jest.fn();
const mockQuery = jest.fn();
const mockDb = { query: mockQuery, pool: {} };
jest.unstable_mockModule('../services/db.service.js', () => ({
    deleteData: mockDeleteData,
    db: mockDb 
}));
const { deleteData } = await import('../controllers/db.controller.js');

describe('deleteData Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('Devrait retourner un statut 204 après suppression réussie', async () => {
    mockDeleteData.mockResolvedValue();
    await deleteData(req, res, next);
    expect(mockDeleteData).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('Devrait appeler next avec l\'erreur en cas d\'échec du service', async () => {    const serviceError = new Error('Database error');
    mockDeleteData.mockRejectedValue(serviceError);
    await deleteData(req, res, next);
    expect(mockDeleteData).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(serviceError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});