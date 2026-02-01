import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CategoriesAddComponent } from './categories-add.component';
import { CategoryService, Category } from '../../services/category.service';

describe('CategoriesAddComponent', () => {
  let component: CategoriesAddComponent;
  let fixture: ComponentFixture<CategoriesAddComponent>;
  let categoryService: CategoryService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesAddComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesAddComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(CategoryService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test de la soumission du formulaire avec succès

  it('should submit form and navigate to categories on success', () => {
    const mockCategory: Category = {
      category_id: 1,
      label: 'New Category',
      created_at: '2026-01-08T00:00:00Z'
    };

    spyOn(categoryService, 'createCategory').and.returnValue(of(mockCategory));
    spyOn(router, 'navigate');

    component.categorieForm.setValue({ label: 'New Category' });
    component.onSubmit();

    expect(categoryService.createCategory).toHaveBeenCalledWith({ label: 'New Category' });
    expect(router.navigate).toHaveBeenCalledWith(['/categories']);
  });

  // Test de l'annulation de l'ajout de catégorie
  it('should navigate to categories on cancel', () => {
    spyOn(router, 'navigate');

    component.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/categories']);
  });

  // Test de la gestion des erreurs lors de la soumission du formulaire
  it('should handle error on incorrect request', () => {
    const errorResponse = { status: 400, statusText: 'Bad Request' };
    
    spyOn(categoryService, 'createCategory').and.returnValue(throwError(() => errorResponse));
    spyOn(router, 'navigate');

    component.categorieForm.setValue({ label: 'Test' });
    component.onSubmit();

    expect(categoryService.createCategory).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Impossible de créer la catégorie. Veuillez réessayer.');
    expect(component.isSubmitting).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  // Test de la validation du formulaire
  it('should not submit if form is invalid', () => {
    spyOn(categoryService, 'createCategory');

    component.categorieForm.setValue({ label: '' });
    component.onSubmit();

    expect(categoryService.createCategory).not.toHaveBeenCalled();
  });

});
