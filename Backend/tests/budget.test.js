// Ce fichier fait tous les tests qui correspondent au budget (controllers / services / routes)

import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

// On initialise tout les mock pour ne pas avoir à appeler le service (et donc la base de données)
const mockGetBudgets = jest.fn();
const mockGetBudgetById = jest.fn();
const mockCreateBudget = jest.fn();
const mockUpdateBudget = jest.fn();
const mockDeleteBudget = jest.fn();

jest.unstable_mockModule('../services/budgets.service.js', () => ({
  getBudgets: mockGetBudgets,
  getBudgetById: mockGetBudgetById,
  createBudget: mockCreateBudget,
  updateBudget: mockUpdateBudget,
  deleteBudget: mockDeleteBudget,
}));

// On importe l'app
const { default: app } = await import('../app.js');

// On teste la récupération de tous les budgets
describe('GET /budgets', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait retourner tous les budgets', async () => {

    // On défini ce que la fonction du service mocké doit retournée
    const mockBudgets = [
      { id: 1, name: 'Budget 1', amount: 1000 },
      { id: 2, name: 'Budget 2', amount: 2000 },
      { id: 16, name: "Budget pour le mois d'avril", amount: 5000}
    ];
    
    mockGetBudgets.mockResolvedValue(mockBudgets);

    const response = await request(app)
      .get('/budgets')
      .expect(200)
      .expect('Content-Type', /json/);
    
    expect(response.body).toEqual(mockBudgets);
  });

  it('devrait gérer les erreurs 404', async () => {
    const response = await request(app)
      .get('/budget') // J'enlève un "s" et la route n'existe donc pas
      .expect(404);
  });

  
});

// On teste la récupération d'un budget par id
describe('GET /budgets/id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait retourner le deuxième budget', async () => {
    const mockBudget = { id: 2, name: 'Budget 2', amount: 2000 };
    
    mockGetBudgetById.mockResolvedValue(mockBudget);

    const response = await request(app)
      .get('/budgets/2')
      .expect(200)
      .expect('Content-Type', /json/);
    
    expect(response.body).toEqual(mockBudget);
  });

  it('devrait gérer les erreurs 404', async () => {
    mockGetBudgetById.mockResolvedValue(null);

    const response = await request(app)
      .get('/budgets/1') // l'id "1" n'est pas mocké donc c'est comme si il n'était pas dans la bdd -> Erreur
      .expect(404);
  });
});

// On teste la création de budget
describe('POST /budgets', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait créer un nouveau budget', async () => {
    const newBudget = {
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const createdBudget = {
      budget_id: 1,
      ...newBudget
    };

    mockCreateBudget.mockResolvedValue(createdBudget);

    const response = await request(app)
      .post('/budgets')
      .send(newBudget)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(response.body).toEqual(createdBudget);
    expect(mockCreateBudget).toHaveBeenCalledWith(newBudget);
  });

  // La on teste les filtres ZOD pour le champ category
  it('devrait retourner 400 si category_id manque', async () => {
    const invalidBudget = {
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si category_id est négatif', async () => {
    const invalidBudget = {
      category_id: -1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('positif');
  });

  it('devrait retourner 400 si category_id est zéro', async () => {
    const invalidBudget = {
      category_id: 0,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si category_id n\'est pas un entier', async () => {
    const invalidBudget = {
      category_id: 1.5,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si category_id est une chaîne', async () => {
    const invalidBudget = {
      category_id: 'abc',
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // La on teste les filtres ZOD pour le champ allocated_amount
  it('devrait retourner 400 si allocated_amount est négatif', async () => {
    const invalidBudget = {
      category_id: 1,
      allocated_amount: -100,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('positif');
  });

  it('devrait retourner 400 si allocated_amount est zéro', async () => {
    const invalidBudget = {
      category_id: 1,
      allocated_amount: 0,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si allocated_amount manque', async () => {
    const invalidBudget = {
      category_id: 1,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si allocated_amount est une chaîne', async () => {
    const invalidBudget = {
      category_id: 1,
      allocated_amount: 'cinq cents',
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // La on teste les filtres ZOD pour le champ period_start
  it('devrait retourner 400 si period_start manque', async () => {
    const invalidBudget = {
      category_id: 1,
      allocated_amount: 500,
      period_end: '2026-01-31'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // La on teste les filtres ZOD pour le champ period_end
  it('devrait retourner 400 si period_end manque', async () => {
    const invalidBudget = {
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01'
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // La on teste si on envoi rien dans le body
  it('devrait retourner 400 si le body est vide', async () => {
    const response = await request(app)
      .post('/budgets')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  // La on teste si on met plusieurs champs invalides dans le body
  it('devrait retourner plusieurs erreurs si plusieurs champs sont invalides', async () => {
    const invalidBudget = {
      category_id: -1,
      allocated_amount: -100
    };

    const response = await request(app)
      .post('/budgets')
      .send(invalidBudget)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('devrait gérer les erreurs du service', async () => {
    const newBudget = {
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    mockCreateBudget.mockRejectedValue(new Error('DB Error'));

    const response = await request(app)
      .post('/budgets')
      .send(newBudget)
      .expect(500);
  });
});

// On teste la modification d'un budget selon l'id
describe('PUT /budgets/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait mettre à jour un budget existant', async () => {
    const updateData = {
      allocated_amount: 750,
      period_start: '2026-02-01',
      period_end: '2026-02-28'
    };

    const updatedBudget = {
      budget_id: 1,
      category_id: 1,
      ...updateData
    };

    mockUpdateBudget.mockResolvedValue(updatedBudget);

    const response = await request(app)
      .put('/budgets/1')
      .send(updateData)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toEqual(updatedBudget);
    expect(mockUpdateBudget).toHaveBeenCalledWith(1, updateData);
  });

  it('devrait permettre une mise à jour partielle', async () => {
    const updateData = {
      allocated_amount: 1000
    };

    const updatedBudget = {
      budget_id: 1,
      category_id: 1,
      allocated_amount: 1000,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    mockUpdateBudget.mockResolvedValue(updatedBudget);

    const response = await request(app)
      .put('/budgets/1')
      .send(updateData)
      .expect(200);

    expect(response.body.allocated_amount).toBe(1000);
  });

  it('devrait permettre une mise à jour avec un body vide (aucun champ)', async () => {
    const updatedBudget = {
      budget_id: 1,
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    mockUpdateBudget.mockResolvedValue(updatedBudget);

    const response = await request(app)
      .put('/budgets/1')
      .send({})
      .expect(200);

    expect(mockUpdateBudget).toHaveBeenCalledWith(1, {});
  });

  // La on teste les filtres ZOD pour le champ ID
  it('devrait retourner 400 si l\'ID n\'est pas un nombre', async () => {
    const response = await request(app)
      .put('/budgets/abc')
      .send({ allocated_amount: 500 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('nombre');
  });

  it('devrait retourner 400 si l\'ID contient des caractères spéciaux', async () => {
    const response = await request(app)
      .put('/budgets/1-2')
      .send({ allocated_amount: 500 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si l\'ID est un nombre décimal dans l\'URL', async () => {
    const response = await request(app)
      .put('/budgets/1.5')
      .send({ allocated_amount: 500 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // La on teste les filtres ZOD pour le champ category_id
  it('devrait retourner 400 si category_id est négatif lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ category_id: -1 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('positif');
  });

  it('devrait retourner 400 si category_id est zéro lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ category_id: 0 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si category_id n\'est pas un entier lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ category_id: 1.5 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si category_id est une chaîne lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ category_id: 'abc' })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // La on teste les filtres ZOD pour le champ allocated_amount
  it('devrait retourner 400 si allocated_amount est négatif', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ allocated_amount: -100 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('positif');
  });

  it('devrait retourner 400 si allocated_amount est zéro lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ allocated_amount: 0 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si allocated_amount est une chaîne lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ allocated_amount: 'cinq cents' })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  // Encore une fois ici avec plusieurs champs invalides dans le body
  it('devrait retourner plusieurs erreurs si plusieurs champs sont invalides lors de la mise à jour', async () => {
    const response = await request(app)
      .put('/budgets/1')
      .send({ category_id: -1, allocated_amount: -100 })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('devrait gérer les erreurs du service', async () => {
    mockUpdateBudget.mockRejectedValue(new Error('DB Error'));

    const response = await request(app)
      .put('/budgets/1')
      .send({ allocated_amount: 500 })
      .expect(500);
  });
});

// On teste la suppression d'un budget selon l'id
describe('DELETE /budgets/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait supprimer un budget existant', async () => {
    mockDeleteBudget.mockResolvedValue();

    const response = await request(app)
      .delete('/budgets/1')
      .expect(204);

    expect(mockDeleteBudget).toHaveBeenCalledWith(1);
  });

  // Rebelote, on teste que le filtre de l'id soit bon
  it('devrait retourner 400 si l\'ID n\'est pas un nombre', async () => {
    const response = await request(app)
      .delete('/budgets/abc')
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('nombre');
  });

  it('devrait retourner 400 si l\'ID contient des caractères spéciaux', async () => {
    const response = await request(app)
      .delete('/budgets/1-2')
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si l\'ID est un nombre décimal dans l\'URL', async () => {
    const response = await request(app)
      .delete('/budgets/1.5')
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('devrait retourner 400 si l\'ID est vide', async () => {
    const response = await request(app)
      .delete('/budgets/')
      .expect(404); // Route non trouvée car DELETE budgets sans ID
  });

  it('devrait accepter un ID avec des zéros en tête', async () => {
    mockDeleteBudget.mockResolvedValue();

    const response = await request(app)
      .delete('/budgets/001')
      .expect(204);

    expect(mockDeleteBudget).toHaveBeenCalledWith(1);
  });

  it('devrait accepter un grand ID numérique', async () => {
    mockDeleteBudget.mockResolvedValue();

    const response = await request(app)
      .delete('/budgets/999999')
      .expect(204);

    expect(mockDeleteBudget).toHaveBeenCalledWith(999999);
  });

  it('devrait gérer les erreurs du service', async () => {
    mockDeleteBudget.mockRejectedValue(new Error('DB Error'));

    const response = await request(app)
      .delete('/budgets/1')
      .expect(500);
  });
});
