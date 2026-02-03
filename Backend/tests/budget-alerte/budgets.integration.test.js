import request from 'supertest';
import app from '../../app.js';

describe('Budget Alerts - Integration Tests', () => {
  test('GET /budgets/alerts retourne les alertes actives', async () => {
    const res = await request(app).get('/budgets/alerts');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('alerts');
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  test('POST /transactions retourne alerte si dépassement', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        amount: 20,
        type: 'expense',
        category_id: 4,
        transaction_date: '2026-01-15'
      });

    expect(res.status).toBe(201);
    expect(res.body.alert).toBeDefined();
    expect(res.body.alert.status).toBe('OVER_BUDGET');
  });
});