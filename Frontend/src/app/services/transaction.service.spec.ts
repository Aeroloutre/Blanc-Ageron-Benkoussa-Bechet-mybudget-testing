import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TransactionService, Transaction, TransactionFilters } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/transactions';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test du GET de toutes les transactions
  it('should retrieve all transactions', () => {
    const mockTransactions: Transaction[] = [
      {
        transaction_id: 1,
        amount: 50.00,
        type: 'expense',
        transaction_date: '2026-01-05',
        category_id: 1
      }
    ];

    service.getTransactions().subscribe(transactions => {
      expect(transactions).toEqual(mockTransactions);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTransactions);
  });

  // Test du GET des transactions avec filtres
  it('should retrieve transactions with filters', () => {
    const filters: TransactionFilters = { category_id: 1, type: 'expense' };

    service.getTransactions(filters).subscribe();

    const req = httpMock.expectOne(req => req.url === apiUrl);
    expect(req.request.params.get('category_id')).toBe('1');
    expect(req.request.params.get('type')).toBe('expense');
    req.flush([]);
  });

  // Test du GET d'une transaction par id
  it('should retrieve a transaction by id', () => {
    const mockTransaction: Transaction = {
      transaction_id: 1,
      amount: 50.00,
      type: 'expense',
      transaction_date: '2026-01-05'
    };

    service.getTransactionById(1).subscribe(transaction => {
      expect(transaction).toEqual(mockTransaction);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush(mockTransaction);
  });

  // Test de la création d'une nouvelle transaction
  it('should create a new transaction', () => {
    const newTransaction: Transaction = {
      amount: 75.50,
      type: 'expense',
      transaction_date: '2026-01-08',
      category_id: 1
    };

    service.createTransaction(newTransaction).subscribe(transaction => {
      expect(transaction.transaction_id).toBeDefined();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ ...newTransaction, transaction_id: 2 });
  });

  // Test de la mise à jour d'une transaction
  it('should update a transaction', () => {
    const update: Partial<Transaction> = { amount: 85.00 };

    service.updateTransaction(1, update).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ transaction_id: 1, ...update });
  });

  // Test de la suppression d'une transaction
  it('should delete a transaction', () => {
    service.deleteTransaction(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Test de gestion des erreurs

  it('should handle error when retrieving transactions fails', () => {
    service.getTransactions().subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(apiUrl).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when transaction by id not found', () => {
    service.getTransactionById(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });
    httpMock.expectOne(`${apiUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle backend error when creating transaction', () => {
    service.createTransaction({ amount: 50, type: 'expense', transaction_date: '2026-01-08' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(apiUrl).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle validation error when creating transaction', () => {
    service.createTransaction({ amount: -50, type: 'expense', transaction_date: 'invalid' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });
    httpMock.expectOne(apiUrl).flush('Invalid data', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle backend error when updating transaction', () => {
    service.updateTransaction(1, { amount: 85 }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle validation error when updating transaction', () => {
    service.updateTransaction(1, { amount: -100 }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Invalid', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle backend error when deleting transaction', () => {
    service.deleteTransaction(1).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when deleting non-existent transaction', () => {
    service.deleteTransaction(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });
    httpMock.expectOne(`${apiUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
