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
    // Mock pour la vue SQL budget_status utilisée par getBudgetAlerts()
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          budget_id: 1,
          category_id: 1,
          category_label: 'Alimentation',
          allocated_amount: 300,
          spent_amount: 350,
          percent_used: 116.67,
          status: 'OVER_BUDGET'
        },
        {
          budget_id: 2,
          category_id: 2,
          category_label: 'Transport',
          allocated_amount: 200,
          spent_amount: 180,
          percent_used: 90,
          status: 'WARNING'
        }
      ]
    });

    const res = await request(app).get('/budgets/alerts');
    
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM budget_status')
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('alerts');
    expect(res.body).toHaveProperty('count');
    expect(Array.isArray(res.body.alerts)).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.alerts[0]).toHaveProperty('status', 'OVER_BUDGET');
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