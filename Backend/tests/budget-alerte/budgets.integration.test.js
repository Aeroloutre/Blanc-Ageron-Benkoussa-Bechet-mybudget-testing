import { jest } from '@jest/globals';
import request from 'supertest';

// Mock de la base de données
const mockQuery = jest.fn();
jest.unstable_mockModule('../../db.js', () => ({
  db: { query: mockQuery },
  default: { query: mockQuery }
}));

const { default: app } = await import('../../app.js');

describe('Budget Alerts - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /budgets/alerts retourne les alertes actives', async () => {
    // Mock pour service.getBudgetAlerts()
    mockQuery.mockResolvedValueOnce({
      rows: [{
        budget_id: 1,
        category_label: 'Alimentation',
        allocated_amount: 300,
        spent_amount: 350,
        status: 'OVER_BUDGET'
      }]
    });

    const res = await request(app).get('/budgets/alerts');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('alerts');
    expect(res.body).toHaveProperty('count');
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  test('POST /transactions retourne alerte si dépassement', async () => {
    // Mock pour budgetService.checkBudgetAfterTransaction
    mockQuery.mockResolvedValueOnce({
      rows: [{
        budget_id: 1,
        allocated_amount: 300,
        spent_amount: 320,
        alert: true,
        status: 'OVER_BUDGET'
      }]
    });
    
    // Mock pour transactionService.createTransaction
    mockQuery.mockResolvedValueOnce({
      rows: [{ 
        transaction_id: 1,
        amount: 20,
        type: 'expense',
        category_id: 4,
        transaction_date: '2026-01-15'
      }]
    });

    const res = await request(app)
      .post('/transactions')
      .send({
        amount: 20,
        type: 'expense',
        category_id: 4,
        transaction_date: '2026-01-15'
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction).toBeDefined();
    expect(res.body.alert).toBeDefined();
    expect(res.body.alert.status).toBe('OVER_BUDGET');
  });
});