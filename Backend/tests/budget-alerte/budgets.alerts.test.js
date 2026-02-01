import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../db.js', () => ({ db: { query: mockQuery } }));

const { getBudgetAlerts, checkBudgetAfterTransaction } = await import('../../services/budgets.service.js');

describe('Budget Alerts', () => {
  beforeEach(() => mockQuery.mockClear());

  test('getBudgetAlerts retourne alertes WARNING et OVER_BUDGET', async () => {
    mockQuery.mockResolvedValue({ rows: [{ status: 'WARNING' }] });
    const alerts = await getBudgetAlerts();
    expect(alerts).toHaveLength(1);
  });

  test('checkBudgetAfterTransaction détecte dépassement', async () => {
    mockQuery.mockResolvedValue({ rows: [{ allocated_amount: 300, spent_amount: 290 }] });
    const result = await checkBudgetAfterTransaction({
      category_id: 4, amount: 20, transaction_date: '2026-01-15', type: 'expense'
    });
    expect(result.alert).toBe(true);
  });
});