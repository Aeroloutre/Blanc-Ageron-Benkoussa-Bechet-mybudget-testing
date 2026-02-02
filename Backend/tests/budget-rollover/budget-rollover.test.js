import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db.js', () => ({ db: { query: mockQuery } }));

const { createBudgetWithRollover } = await import('../services/budgets.service.js');

describe('Budget Rollover', () => {
  beforeEach(() => mockQuery.mockClear());

  test('reporte excédent du mois précédent', async () => {
    // Mock: budget janvier avec 50€ restants
    mockQuery.mockResolvedValueOnce({
      rows: [{ allocated_amount: 300, spent_amount: 250 }]
    });
    
    // Mock: création nouveau budget
    mockQuery.mockResolvedValueOnce({
      rows: [{ budget_id: 2, allocated_amount: 350 }]
    });

    const result = await createBudgetWithRollover({
      category_id: 4,
      allocated_amount: 300,
      period_start: '2026-02-01',
      period_end: '2026-02-28'
    });

    expect(result.allocated_amount).toBe(350); // 300 + 50
    expect(result.rollover_amount).toBe(50);
  });

  test('déduit dépassement du mois précédent', async () => {
    // Budget janvier dépassé de 20€
    mockQuery.mockResolvedValueOnce({
      rows: [{ allocated_amount: 300, spent_amount: 320 }]
    });
    
    mockQuery.mockResolvedValueOnce({
      rows: [{ budget_id: 2, allocated_amount: 280 }]
    });

    const result = await createBudgetWithRollover({
      category_id: 4,
      allocated_amount: 300,
      period_start: '2026-02-01',
      period_end: '2026-02-28'
    });

    expect(result.allocated_amount).toBe(280); // 300 - 20
    expect(result.rollover_amount).toBe(-20);
  });
});