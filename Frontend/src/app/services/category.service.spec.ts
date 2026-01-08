import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CategoryService, Category } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/categories';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test du GET de toutes les catégories
  it('should retrieve all categories', () => {
    const mockCategories: Category[] = [
      { category_id: 1, label: 'Food', created_at: '2026-01-01T00:00:00Z' },
      { category_id: 2, label: 'Transport', created_at: '2026-01-01T00:00:00Z' }
    ];

    service.getCategories().subscribe(categories => {
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  // Test du GET d'une catégorie par id
  it('should retrieve a category by id', () => {
    const mockCategory: Category = {
      category_id: 1,
      label: 'Food',
      created_at: '2026-01-01T00:00:00Z'
    };

    service.getCategoryById(1).subscribe(category => {
      expect(category).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush(mockCategory);
  });

  // Test de la création d'une nouvelle catégorie
  it('should create a new category', () => {
    const newCategory = { label: 'Healthcare' };
    const createdCategory: Category = {
      category_id: 4,
      label: 'Healthcare',
      created_at: '2026-01-08T00:00:00Z'
    };

    service.createCategory(newCategory).subscribe(category => {
      expect(category.category_id).toBeDefined();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(createdCategory);
  });

  // Test de la mise à jour d'une catégorie
  it('should update a category', () => {
    const update: Partial<Category> = { label: 'Groceries' };

    service.updateCategory(1, update).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ category_id: 1, ...update });
  });

  // Test de la suppression d'une catégorie
  it('should delete a category', () => {
    service.deleteCategory(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Test de gestion des erreurs

  it('should handle error when retrieving categories fails', () => {
    service.getCategories().subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(apiUrl).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when category by id not found', () => {
    service.getCategoryById(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });
    httpMock.expectOne(`${apiUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle backend error when creating category', () => {
    service.createCategory({ label: 'Test' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(apiUrl).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle validation error when creating category', () => {
    service.createCategory({ label: '' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });
    httpMock.expectOne(apiUrl).flush('Invalid data', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle backend error when updating category', () => {
    service.updateCategory(1, { label: 'Updated' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle validation error when updating category', () => {
    service.updateCategory(1, { label: '' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Invalid', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle backend error when deleting category', () => {
    service.deleteCategory(1).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });
    httpMock.expectOne(`${apiUrl}/1`).flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when deleting non-existent category', () => {
    service.deleteCategory(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });
    httpMock.expectOne(`${apiUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
