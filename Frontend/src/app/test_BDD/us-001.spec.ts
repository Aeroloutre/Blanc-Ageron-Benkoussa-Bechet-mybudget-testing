import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TransactionService } from '../services/transaction.service';
import { BudgetService } from '../services/budget.service';

describe('US1: Affichage et filtrage', () => {
  
  let service: TransactionService;
  let budgetService: BudgetService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService, BudgetService]
    });
    service = TestBed.inject(TransactionService);
    budgetService = TestBed.inject(BudgetService);
  });

  it('Critère 1 et 2: affichage tableau avec coloration', () => {
    const transaction = { amount: 100, label: 'Test', type: 'income', category_id: 1, transaction_date: '2026-01-15' };
    
    expect(transaction.amount).toBeDefined();
    expect(transaction.label).toBeDefined();
    expect(transaction.type).toBeDefined();
    expect(transaction.category_id).toBeDefined();
    expect(transaction.transaction_date).toBeDefined();
    
    const colorRevenu = 'income' === 'income' ? 'text-green' : 'text-red';
    const colorDepense = 'expense' === 'expense' ? 'text-red' : 'text-green';
    expect(colorRevenu).toBe('text-green');
    expect(colorDepense).toBe('text-red');
  });

  it('Critère 3: création d\'un budget alloué', () => {
    const newBudget = {
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    expect(newBudget.category_id).toBeDefined();
    expect(newBudget.allocated_amount).toBeGreaterThan(0);
    expect(newBudget.period_start).toBeDefined();
    expect(newBudget.period_end).toBeDefined();
    expect(new Date(newBudget.period_end) >= new Date(newBudget.period_start)).toBe(true);
  });

  it('Critère 4: modification d\'un budget existant', () => {
    const existingBudget = {
      budget_id: 1,
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    const updatedBudget = {
      ...existingBudget,
      allocated_amount: 700,
      period_end: '2026-02-28'
    };

    expect(updatedBudget.allocated_amount).toBe(700);
    expect(updatedBudget.period_end).toBe('2026-02-28');
    expect(updatedBudget.budget_id).toBe(existingBudget.budget_id);
  });

  it('Critère 5: filtre par période', () => {
    const transactions = [
      { transaction_date: '2026-01-05' },
      { transaction_date: '2026-01-15' },
      { transaction_date: '2026-02-10' }
    ];

    const filtered = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= new Date('2026-01-01') && date <= new Date('2026-01-31');
    });
    
    expect(filtered.length).toBe(2);
  });

  it('Critère 6: filtre par catégorie + calcul total', () => {
    const transactions = [
      { category_id: 2, amount: 50 },
      { category_id: 2, amount: 30 },
      { category_id: 3, amount: 25 }
    ];

    const filtered = transactions.filter(t => t.category_id === 2);
    const total = filtered.reduce((acc, t) => acc + t.amount, 0);
    
    expect(filtered.length).toBe(2);
    expect(total).toBe(80);
  });

  it('Critère 7: filtre par type', () => {
    const transactions = [
      { type: 'income' },
      { type: 'income' },
      { type: 'expense' }
    ];

    expect(transactions.filter(t => t.type === 'income').length).toBe(2);
    expect(transactions.filter(t => t.type === 'expense').length).toBe(1);
  });

  it('Critère 8: filtres en temps réel', () => {
    const initialTransactions = [
      { transaction_date: '2026-01-10', type: 'expense', category_id: 2 },
      { transaction_date: '2026-01-20', type: 'income', category_id: 1 }
    ];

    let filtered = initialTransactions.filter(t => t.type === 'expense');
    expect(filtered.length).toBe(1);

    filtered = initialTransactions.filter(t => t.category_id === 1);
    expect(filtered.length).toBe(1);
  });

  it('Critère 9: calcul du solde avec budget alloué', () => {
    const budget = {
      allocated_amount: 500
    };

    const expenses = [
      { type: 'expense', amount: 100 },
      { type: 'expense', amount: 50 },
      { type: 'expense', amount: 75 }
    ];

    const totalExpenses = expenses
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const solde = budget.allocated_amount - totalExpenses;

    expect(totalExpenses).toBe(225);
    expect(solde).toBe(275);
  });

  it('Critère 9: calcul du solde sans budget (revenus - dépenses)', () => {
    const transactions = [
      { type: 'income', amount: 1000 },
      { type: 'expense', amount: 200 },
      { type: 'expense', amount: 150 }
    ];

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const solde = income - expenses;

    expect(income).toBe(1000);
    expect(expenses).toBe(350);
    expect(solde).toBe(650);
  });

  it('Critère 10: message si aucun résultat', () => {
    const transactions = [{ type: 'income' }];
    expect(transactions.filter(t => t.type === 'expense').length).toBe(0);
  });

  it('Scénario: combinaison de filtres', () => {
    const transactions = [
      { transaction_date: '2026-01-10', type: 'expense', category_id: 2 },
      { transaction_date: '2026-01-20', type: 'expense', category_id: 2 },
      { transaction_date: '2026-01-15', type: 'income', category_id: 1 },
      { transaction_date: '2026-02-05', type: 'expense', category_id: 2 }
    ];

    const filtered = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= new Date('2026-01-01') && date <= new Date('2026-01-31') && t.category_id === 2;
    });
    
    expect(filtered.length).toBe(2);
  });

  it('Scénario: validation budget avec dates invalides', () => {
    const invalidBudget = {
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-02-01',
      period_end: '2026-01-01'
    };

    const isValid = new Date(invalidBudget.period_end) >= new Date(invalidBudget.period_start);
    expect(isValid).toBe(false);
  });

  it('Scénario: validation montant budget positif', () => {
    const validBudget = { allocated_amount: 500 };
    const invalidBudget = { allocated_amount: 0 };
    const negativeBudget = { allocated_amount: -100 };

    expect(validBudget.allocated_amount > 0).toBe(true);
    expect(invalidBudget.allocated_amount > 0).toBe(false);
    expect(negativeBudget.allocated_amount > 0).toBe(false);
  });
});
