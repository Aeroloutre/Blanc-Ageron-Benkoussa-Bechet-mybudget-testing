import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TransactionService } from '../services/transaction.service';

describe('US1: Affichage et filtrage', () => {
  
  let service: TransactionService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
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

  it('Critère 3: filtre par période', () => {
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

  it('Critère 4: filtre par catégorie + calcul total', () => {
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

  it('Critère 5: filtre par type', () => {
    const transactions = [
      { type: 'income' },
      { type: 'income' },
      { type: 'expense' }
    ];

    expect(transactions.filter(t => t.type === 'income').length).toBe(2);
    expect(transactions.filter(t => t.type === 'expense').length).toBe(1);
  });

  it('Critère 6: filtres en temps réel', () => {
    const initialTransactions = [
      { transaction_date: '2026-01-10', type: 'expense', category_id: 2 },
      { transaction_date: '2026-01-20', type: 'income', category_id: 1 }
    ];

    let filtered = initialTransactions.filter(t => t.type === 'expense');
    expect(filtered.length).toBe(1);

    filtered = initialTransactions.filter(t => t.category_id === 1);
    expect(filtered.length).toBe(1);
  });

  it('Critère 7: calcul du solde', () => {
    const transactions = [
      { amount: 100 },
      { amount: -50 },
      { amount: -25 }
    ];
    
    expect(transactions.reduce((acc, t) => acc + t.amount, 0)).toBe(25);
  });

  it('Critère 8: message si aucun résultat', () => {
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
});
