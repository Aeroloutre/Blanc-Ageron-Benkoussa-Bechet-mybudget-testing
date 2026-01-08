import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BudgetService, Budget } from './budget.service';

describe('BudgetService', () => {
  let service: BudgetService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/budgets';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BudgetService]
    });
    service = TestBed.inject(BudgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test du GET de tous les budgets
  it('should retrieve all budgets', () => {
    const mockBudgets: Budget[] = [
      {
        budget_id: 1,
        category_id: 1,
        allocated_amount: 500,
        period_start: '2026-01-01',
        period_end: '2026-01-31'
      }
    ];

    service.getBudgets().subscribe(budgets => {
      expect(budgets).toEqual(mockBudgets);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockBudgets);
  });

  // Test du GET d'un budget par id
  it('should retrieve a budget by id', () => {
    const mockBudget: Budget = {
      budget_id: 1,
      category_id: 1,
      allocated_amount: 500,
      period_start: '2026-01-01',
      period_end: '2026-01-31'
    };

    service.getBudgetById(1).subscribe(budget => {
      expect(budget).toEqual(mockBudget);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush(mockBudget);
  });

  // Test de la création d'un nouveau budget
  it('should create a new budget', () => {
    const newBudget: Budget = {
      category_id: 3,
      allocated_amount: 300,
      period_start: '2026-02-01',
      period_end: '2026-02-28'
    };

    service.createBudget(newBudget).subscribe(budget => {
      expect(budget.budget_id).toBeDefined();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ ...newBudget, budget_id: 3 });
  });

  // Test de la mise à jour d'un budget
  it('should update a budget', () => {
    const update: Partial<Budget> = { allocated_amount: 600 };

    service.updateBudget(1, update).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ budget_id: 1, category_id: 1, ...update });
  });

  // Test de la suppression d'un budget
  it('should delete a budget', () => {
    service.deleteBudget(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null  );
  });

  // Gestion des erreurs

  it('should handle error when retrieving budgets fails', () => {
    service.getBudgets().subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(apiUrl).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when budget by id not found', () => {
    service.getBudgetById(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });
    httpMock.expectOne(`${apiUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle backend error when creating budget', () => {
    service.createBudget({ category_id: 1, allocated_amount: 500, period_start: '2026-01-01', period_end: '2026-01-31' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(apiUrl).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle validation error when creating budget', () => {
    service.createBudget({ category_id: 1, allocated_amount: -100, period_start: 'invalid', period_end: '2026-01-31' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });
    httpMock.expectOne(apiUrl).flush('Invalid data', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle backend error when updating budget', () => {
    service.updateBudget(1, { allocated_amount: 600 }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle validation error when updating budget', () => {
    service.updateBudget(1, { allocated_amount: -200 }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Invalid', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle backend error when deleting budget', () => {
    service.deleteBudget(1).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when deleting non-existent budget', () => {
    service.deleteBudget(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });
    httpMock.expectOne(`${apiUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
