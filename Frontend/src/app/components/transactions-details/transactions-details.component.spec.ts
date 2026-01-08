import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { TransactionsDetailsComponent } from './transactions-details.component';
import { TransactionService, Transaction } from '../../services/transaction.service';

registerLocaleData(localeFr);

describe('TransactionsDetailsComponent', () => {
  let component: TransactionsDetailsComponent;
  let fixture: ComponentFixture<TransactionsDetailsComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let router: jasmine.SpyObj<Router>;

  const mockTransaction: Transaction = {
    transaction_id: 1,
    amount: 45.50,
    label: 'Courses Leclerc',
    type: 'expense',
    transaction_date: '2026-01-03',
    category_id: 1,
    category_label: 'Alimentation'
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1')
      }
    }
  };

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionById', 'updateTransaction']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TransactionsDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsDetailsComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    transactionService.getTransactionById.and.returnValue(of(mockTransaction));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test de chargement de la transaction au démarrage
  it('should load transaction on init', (done) => {
    setTimeout(() => {
      expect(transactionService.getTransactionById).toHaveBeenCalledWith(1);
      expect(component.transaction).toBeTruthy();
      expect(component.transaction?.libelle).toBe('Courses Leclerc');
      expect(component.transaction?.montant).toBe(45.50);
      done();
    }, 0);
  });

  // Test de gestion d'erreur lors du chargement de la transaction
  it('should handle error when loading transaction fails', (done) => {
    component.isLoading = false;
    transactionService.getTransactionById.and.returnValue(throwError(() => new Error('Not found')));
    
    component.loadTransaction(1);

    setTimeout(() => {
      expect(component.errorMessage).toBe('Impossible de charger la transaction');
      expect(component.isLoading).toBeFalse();
      done();
    }, 0);
  });

  // Test de basculement en mode édition
  describe('Edit Mode', () => {
    beforeEach((done) => {
      setTimeout(() => {
        component.transaction = {
          id: 1,
          libelle: 'Courses',
          type: 'retrait',
          montant: 45.50,
          date: new Date(),
          categoryId: 1,
          categoryName: 'Alimentation'
        };
        done();
      }, 0);
    });

    // Test de basculement en mode édition
    it('should toggle edit mode', () => {
      expect(component.isEditing).toBeFalse();
      
      component.toggleEdit();
      expect(component.isEditing).toBeTrue();
    });

    // Test de copie des données lors du passage en mode édition
    it('should copy transaction data when entering edit mode', () => {
      component.toggleEdit();
      
      expect(component.editedTransaction.libelle).toBe('Courses');
      expect(component.editedTransaction.montant).toBe(45.50);
    });

    // Test d'annulation de l'édition
    it('should cancel edit and restore original data', () => {
      component.toggleEdit();
      component.editedTransaction.libelle = 'Modified';
      
      component.cancelEdit();
      
      expect(component.isEditing).toBeFalse();
      expect(component.editedTransaction.libelle).toBe('Courses');
    });
  });

  // Test de sauvegarde de la transaction modifiée
  describe('Save Transaction', () => {
    beforeEach((done) => {
      setTimeout(() => {
        component.transaction = {
          id: 1,
          libelle: 'Courses',
          type: 'retrait',
          montant: 45.50,
          date: new Date(),
          categoryId: 1,
          categoryName: 'Alimentation'
        };
        component.editedTransaction = { ...component.transaction };
        component.isEditing = true;
        done();
      }, 0);
    });

    // Test de sauvegarde avec des modifications valides
    it('should save valid changes', (done) => {
      transactionService.updateTransaction.and.returnValue(of({...mockTransaction, label: 'Modified'}));
      component.editedTransaction.libelle = 'Modified';
      component.editedTransaction.montant = 50;
      
      component.saveTransaction();

      setTimeout(() => {
        expect(transactionService.updateTransaction).toHaveBeenCalledWith(1, {
          label: 'Modified',
          amount: 50,
          type: 'expense'
        });
        expect(component.isEditing).toBeFalse();
        done();
      }, 0);
    });

    // Test de sauvegarde avec des données invalides
    it('should not save with invalid data', () => {
      component.editedTransaction.libelle = '';
      
      component.saveTransaction();
      
      expect(transactionService.updateTransaction).not.toHaveBeenCalled();
      expect(component.errorMessage).toBeTruthy();
    });

    // Test de gestion d'erreur lors de la sauvegarde
    it('should handle error when update fails', (done) => {
      transactionService.updateTransaction.and.returnValue(throwError(() => new Error('Update failed')));
      component.editedTransaction.libelle = 'Modified';
      
      component.saveTransaction();

      setTimeout(() => {
        expect(component.errorMessage).toBe('Erreur lors de la modification');
        expect(component.isEditing).toBeTrue();
        done();
      }, 0);
    });
  });
});
