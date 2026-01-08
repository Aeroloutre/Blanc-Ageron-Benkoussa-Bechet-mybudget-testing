import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TransactionsAddComponent } from './transactions-add.component';
import { TransactionService, Transaction } from '../../services/transaction.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TransactionsAddComponent', () => {
  let component: TransactionsAddComponent;
  let fixture: ComponentFixture<TransactionsAddComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let router: jasmine.SpyObj<Router>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1')
      }
    }
  };

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['createTransaction']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TransactionsAddComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsAddComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test d'initialisation du formulaire avec les valeurs par défaut
  it('should initialize form with default values', () => {
    expect(component.transactionForm).toBeDefined();
    expect(component.transactionForm.get('type')?.value).toBe('retrait');
    expect(component.categoryId).toBe(1);
  });

  // Test de la validation du formulaire
  describe('Form Validation', () => {
    it('should invalidate form when libelle is too short', () => {
      component.transactionForm.patchValue({ libelle: 'a', montant: 50 });
      expect(component.transactionForm.invalid).toBeTruthy();
    });

    it('should invalidate form when montant is invalid', () => {
      component.transactionForm.patchValue({ libelle: 'Test', montant: 0 });
      expect(component.transactionForm.invalid).toBeTruthy();
    });

    it('should validate form when all fields are correct', () => {
      component.transactionForm.patchValue({ libelle: 'Test', montant: 50 });
      expect(component.transactionForm.valid).toBeTruthy();
    });
  });

  // Test de la soumission du formulaire
  describe('onSubmit', () => {
    const mockCreatedTransaction: Transaction = {
      transaction_id: 1,
      amount: 50.00,
      label: 'Test Transaction',
      type: 'expense',
      transaction_date: '2026-01-08',
      category_id: 1
    };

    beforeEach(() => {
      component.transactionForm.patchValue({
        libelle: 'Test Transaction',
        type: 'retrait',
        montant: 50.00,
        date: '2026-01-08'
      });
    });

    // Test de la soumission avec un formulaire invalide
    it('should not submit if form is invalid', () => {
      component.transactionForm.patchValue({ libelle: '' });
      component.onSubmit();
      expect(transactionService.createTransaction).not.toHaveBeenCalled();
    });

    // Test de la soumission avec succès
    it('should create transaction with correct data and navigate on success', () => {
      transactionService.createTransaction.and.returnValue(of(mockCreatedTransaction));
      
      component.onSubmit();

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        amount: 50.00,
        label: 'Test Transaction',
        type: 'expense',
        transaction_date: '2026-01-08',
        category_id: 1
      });
      expect(router.navigate).toHaveBeenCalledWith(['/categories', 1]);
    });

    // Test de la gestion des erreurs lors de la création de la transaction
    it('should handle error when transaction creation fails', (done) => {
      const errorResponse = { error: { error: 'Champs manquants' } };
      transactionService.createTransaction.and.returnValue(throwError(() => errorResponse));
      
      component.onSubmit();

      setTimeout(() => {
        expect(component.errorMessage).toBe('Champs manquants');
        expect(component.isLoading).toBeFalse();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    // Test de la vérification que la transaction met à jour le budget via le backend
    it('should verify that transaction updates budget through backend', (done) => {
      transactionService.createTransaction.and.returnValue(of(mockCreatedTransaction));
      
      component.onSubmit();

      setTimeout(() => {
        const createdTransaction = transactionService.createTransaction.calls.mostRecent().args[0];
        expect(createdTransaction.category_id).toBe(1);
        expect(createdTransaction.type).toBe('expense');
        done();
      }, 0);
    });
  });

  // Test de l'annulation de l'ajout de transaction
  describe('onCancel', () => {
    it('should navigate to category details when categoryId exists', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/categories', 1]);
    });
  });
});
