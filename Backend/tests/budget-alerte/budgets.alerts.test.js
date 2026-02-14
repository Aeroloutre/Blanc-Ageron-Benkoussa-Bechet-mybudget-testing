import { db } from '../../db.js';
import { getBudgetAlerts, checkBudgetAfterTransaction, createBudget } from '../../services/budgets.service.js';
import { createTransaction } from '../../services/transactions.service.js';
import { createCategory } from '../../services/categories.service.js';

describe('Budget Alerts - Real DB Tests', () => {
  let testCategoryId;
  let testBudgetId;

  beforeAll(async () => {
    // Créer une catégorie de test
    const category = await createCategory({ label: 'Test Alimentation Alerts' });
    testCategoryId = category.category_id;
  });

  beforeEach(async () => {
    const budget = await createBudget({
      category_id: testCategoryId,
      allocated_amount: 300,
      period_start: '2026-02-01',
      period_end: '2026-02-28'
    });
    testBudgetId = budget.budget_id;
  });

  afterEach(async () => {
    await db.query('DELETE FROM transactions WHERE category_id = $1', [testCategoryId]);
    await db.query('DELETE FROM budgets WHERE category_id = $1', [testCategoryId]);
  });

  afterAll(async () => {
    await db.query('DELETE FROM categories WHERE category_id = $1', [testCategoryId]);
  });

  test('getBudgetAlerts retourne une alerte quand le budget est  80%', async () => {
    await createTransaction({
      amount: 255,
      type: 'expense',
      category_id: testCategoryId,
      transaction_date: '2026-02-10',
      label: 'Test dépense Warning'
    });

    const alerts = await getBudgetAlerts();
    const myAlert = alerts.find(a => a.budget_id === testBudgetId);
    expect(myAlert).toBeDefined();
    expect(myAlert.status).toBe('WARNING');
    expect(myAlert.percetage_used).toBeCloseTo(80);
    expect(myAlert.spent_amount).toBe(255);
  });

  test('getBudgetAlerts retourne OverBudget en cas de dépassement du budget', async () => {
    await createTransaction({
      amount: 350,
      type: 'expense',
      category_id: testCategoryId,
      transaction_date: '2026-02-15',
      label: 'Test OverBudget'
    });

    const alerts = await getBudgetAlerts();
    const myAlert = alerts.find(a => a.budget_id === testBudgetId)
    expect(myAlert).toBeDefined();
    expect(myAlert.status).toBe('Over_BUDGET');
    expect(myAlert.spent_amount).toBe(350);
  });

  test('checkBudgetAfter Transaction retourne une alerte apres la creation de la transaction', async () => {
    await createTransaction({
      amount: 290,
      type: 'expense',
      category_id: testCategoryId,
      transaction_date: '2026-02-20',
      label: 'Dépense existante'

    }); 

    const alert = await checkBudgetAfterTransaction({
      amount: 20, 
      type: 'expense',
      category_id: testCategoryId,
      transaction_date:'2026-02-21',
      label: 'Dépense test alerte'
    });
  });  
});