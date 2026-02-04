import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CategoriesDetailsComponent } from './categories-details.component';
import { CategoryService, Category } from '../../services/category.service';
import { TransactionService, Transaction } from '../../services/transaction.service';
import { BudgetService, Budget } from '../../services/budget.service';

describe('CategoriesDetailsComponent', () => {
  let component: CategoriesDetailsComponent;
  let fixture: ComponentFixture<CategoriesDetailsComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let budgetService: jasmine.SpyObj<BudgetService>;
  let router: jasmine.SpyObj<Router>;

  const mockCategory: Category = {
    category_id: 1,
    label: 'Food',
    created_at: '2026-01-01T00:00:00Z'
  };

  const mockTransactions: Transaction[] = [
    { transaction_id: 1, amount: 100, type: 'income', transaction_date: '2026-01-05', label: 'Salary' },
    { transaction_id: 2, amount: 50, type: 'expense', transaction_date: '2026-01-06', label: 'Groceries' }
  ];

  const mockBudget: Budget = {
    budget_id: 1,
    category_id: 1,
    allocated_amount: 500,
    period_start: '2026-01-01',
    period_end: '2026-01-31',
    created_at: '2026-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategoryById', 'updateCategory']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactions', 'deleteTransaction']);
    const budgetServiceSpy = jasmine.createSpyObj('BudgetService', ['getBudgets', 'createBudget', 'updateBudget', 'deleteBudget']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CategoriesDetailsComponent, HttpClientTestingModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: BudgetService, useValue: budgetServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    budgetService = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    categoryService.getCategoryById.and.returnValue(of(mockCategory));
    transactionService.getTransactions.and.returnValue(of(mockTransactions));
    budgetService.getBudgets.and.returnValue(of([]));

    fixture = TestBed.createComponent(CategoriesDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test de l'initialisation avec le chargement de la catégorie et des transactions
  it('should load category and transactions on init', () => {
    fixture.detectChanges();
    expect(categoryService.getCategoryById).toHaveBeenCalledWith(1);
    expect(transactionService.getTransactions).toHaveBeenCalledWith({ category_id: 1 });
    expect(component.category).toEqual(mockCategory);
    expect(component.transactions).toEqual(mockTransactions);
  });

  // Test du calcul des totaux
  it('should calculate totals correctly', () => {
    component.transactions = mockTransactions;
    component.calculateTotals();
    expect(component.totalAjouts).toBe(100);
    expect(component.totalRetraits).toBe(50);
    expect(component.solde).toBe(50);
  });

  // Test de la navigation vers l'ajout de transaction
  it('should navigate to add transaction', () => {
    component.category = mockCategory;
    component.addTransaction();
    expect(router.navigate).toHaveBeenCalledWith(['/categories', 1, 'transactions', 'add']);
  });

  // Test de la navigation vers les détails de la transaction
  it('should navigate to transaction details', () => {
    component.seeDetailsTransaction(1);
    expect(router.navigate).toHaveBeenCalledWith(['/transactions', 1]);
  });

  // Test de l'édition du nom de la catégorie
  it('should toggle edit mode', () => {
    component.category = mockCategory;
    component.toggleEditName();
    expect(component.isEditingName).toBe(true);
    expect(component.editedName).toBe('Food');
  });

  // Test de la sauvegarde du nom de la catégorie
  it('should save category name', () => {
    component.category = mockCategory;
    component.editedName = 'Updated Food';
    const updated = { ...mockCategory, label: 'Updated Food' };
    categoryService.updateCategory.and.returnValue(of(updated));
    
    component.saveCategoryName();
    
    expect(categoryService.updateCategory).toHaveBeenCalledWith(1, { label: 'Updated Food' });
    expect(component.isEditingName).toBe(false);
  });

  // Test de l'annulation de l'édition
  it('should cancel edit', () => {
    component.category = mockCategory;
    component.isEditingName = true;
    component.editedName = 'Changed';
    
    component.cancelEdit();
    
    expect(component.isEditingName).toBe(false);
    expect(component.editedName).toBe('Food');
  });

  // Test de la suppression de transaction
  it('should delete transaction', () => {
    component.transactions = mockTransactions;
    spyOn(window, 'confirm').and.returnValue(true);
    transactionService.deleteTransaction.and.returnValue(of(void 0));
    
    component.supprimerTransaction(1, new Event('click'));
    
    expect(transactionService.deleteTransaction).toHaveBeenCalledWith(1);
    expect(component.transactions.length).toBe(1);
    expect(component.transactions[0].transaction_id).toBe(2);
  });

  // Test de l'annulation de la suppression de transaction
  it('should not delete transaction when cancelled', () => {
    component.transactions = mockTransactions;
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.supprimerTransaction(1, new Event('click'));
    
    expect(transactionService.deleteTransaction).not.toHaveBeenCalled();
    expect(component.transactions.length).toBe(2);
  });

  // Test de gestion des erreurs
  it('should handle category loading error', () => {
    categoryService.getCategoryById.and.returnValue(throwError(() => ({ status: 404 })));
    
    fixture.detectChanges();
    
    expect(component.error).toBe('Impossible de charger la catégorie.');
    expect(component.loading).toBe(false);
  });

  it('should handle transactions loading error', () => {
    transactionService.getTransactions.and.returnValue(throwError(() => ({ status: 500 })));
    
    fixture.detectChanges();
    
    expect(component.error).toBe('Impossible de charger les transactions.');
    expect(component.loading).toBe(false);
  });

  it('should handle update category error', () => {
    component.category = mockCategory;
    component.editedName = 'New Name';
    spyOn(window, 'alert');
    categoryService.updateCategory.and.returnValue(throwError(() => ({ status: 400 })));
    
    component.saveCategoryName();
    
    expect(window.alert).toHaveBeenCalledWith('Impossible de modifier le nom de la catégorie.');
    expect(component.isEditingName).toBe(false);
  });

  it('should handle delete transaction error', () => {
    component.transactions = mockTransactions;
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    transactionService.deleteTransaction.and.returnValue(throwError(() => ({ status: 500 })));
    
    component.supprimerTransaction(1, new Event('click'));
    
    expect(window.alert).toHaveBeenCalledWith('Impossible de supprimer la transaction.');
  });

  // Tests pour les budgets
  describe('Budget Management', () => {
    it('should load budget on init if exists', () => {
      budgetService.getBudgets.and.returnValue(of([mockBudget]));
      
      fixture.detectChanges();
      
      expect(budgetService.getBudgets).toHaveBeenCalled();
      expect(component.budget).toEqual(mockBudget);
    });

    it('should toggle edit mode for creating budget', () => {
      component.budget = null;
      component.category = mockCategory;
      
      component.toggleEditBudget();
      
      expect(component.isEditingBudget).toBe(true);
      expect(component.editedBudgetAmount).toBe(0);
      expect(component.editedPeriodStart).toBeTruthy();
      expect(component.editedPeriodEnd).toBeTruthy();
    });

    it('should toggle edit mode for updating budget', () => {
      component.budget = mockBudget;
      
      component.toggleEditBudget();
      
      expect(component.isEditingBudget).toBe(true);
      expect(component.editedBudgetAmount).toBe(500);
      expect(component.editedPeriodStart).toBe('2026-01-01');
      expect(component.editedPeriodEnd).toBe('2026-01-31');
    });

    it('should create a new budget', () => {
      component.budget = null;
      component.category = mockCategory;
      component.editedBudgetAmount = 600;
      component.editedPeriodStart = '2026-02-01';
      component.editedPeriodEnd = '2026-02-28';
      
      const newBudget: Budget = {
        budget_id: 2,
        category_id: 1,
        allocated_amount: 600,
        period_start: '2026-02-01',
        period_end: '2026-02-28'
      };
      
      budgetService.createBudget.and.returnValue(of(newBudget));
      
      component.saveBudget();
      
      expect(budgetService.createBudget).toHaveBeenCalledWith({
        category_id: 1,
        allocated_amount: 600,
        period_start: '2026-02-01',
        period_end: '2026-02-28'
      });
      expect(component.isEditingBudget).toBe(false);
    });

    it('should update existing budget', () => {
      component.budget = mockBudget;
      component.editedBudgetAmount = 700;
      component.editedPeriodStart = '2026-01-01';
      component.editedPeriodEnd = '2026-01-31';
      
      const updatedBudget: Budget = {
        ...mockBudget,
        allocated_amount: 700
      };
      
      budgetService.updateBudget.and.returnValue(of(updatedBudget));
      
      component.saveBudget();
      
      expect(budgetService.updateBudget).toHaveBeenCalledWith(1, {
        allocated_amount: 700,
        period_start: '2026-01-01',
        period_end: '2026-01-31'
      });
      expect(component.budget).toEqual(updatedBudget);
      expect(component.isEditingBudget).toBe(false);
    });

    it('should handle budget creation error', () => {
      spyOn(window, 'alert');
      component.budget = null;
      component.category = mockCategory;
      component.editedBudgetAmount = 500;
      component.editedPeriodStart = '2026-01-01';
      component.editedPeriodEnd = '2026-01-31';
      
      budgetService.createBudget.and.returnValue(throwError(() => ({ status: 400 })));
      
      component.saveBudget();
      
      expect(window.alert).toHaveBeenCalledWith('Impossible de créer le budget.');
    });

    it('should handle budget update error', () => {
      spyOn(window, 'alert');
      component.budget = mockBudget;
      component.editedBudgetAmount = 700;
      component.editedPeriodStart = '2026-01-01';
      component.editedPeriodEnd = '2026-01-31';
      
      budgetService.updateBudget.and.returnValue(throwError(() => ({ status: 400 })));
      
      component.saveBudget();
      
      expect(window.alert).toHaveBeenCalledWith('Impossible de modifier le budget.');
    });

    it('should format date for input correctly', () => {
      const dateString = '2026-01-15T10:30:00.000Z';
      const formatted = component.formatDateForInput(dateString);
      
      expect(formatted).toBe('2026-01-15');
    });
  });
});
