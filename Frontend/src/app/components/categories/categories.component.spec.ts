import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { CategoriesComponent } from './categories.component';
import { CategoryService, Category } from '../../services/category.service';
import { BudgetService, Budget } from '../../services/budget.service';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryService: CategoryService;
  let budgetService: BudgetService;
  let router: Router;

  const mockCategories: Category[] = [
    { category_id: 1, label: 'Food', created_at: '2026-01-01T00:00:00Z' },
    { category_id: 2, label: 'Transport', created_at: '2026-01-02T00:00:00Z' }
  ];

  const mockBudgets: Budget[] = [
    { 
      budget_id: 1, 
      category_id: 1, 
      category_label: 'Food', 
      allocated_amount: 500, 
      period_start: '2026-01-01', 
      period_end: '2026-01-31',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    { 
      budget_id: 2, 
      category_id: 2, 
      category_label: 'Transport', 
      allocated_amount: 300, 
      period_start: '2026-01-01', 
      period_end: '2026-01-31',
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(CategoryService);
    budgetService = TestBed.inject(BudgetService);
    router = TestBed.inject(Router);
    
    spyOn(categoryService, 'getCategories').and.returnValue(of(mockCategories));
    spyOn(budgetService, 'getBudgets').and.returnValue(of(mockBudgets));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test d'affichage des catégories

  it('should display categories', () => {
    component.categories = mockCategories;
    fixture.detectChanges();

    const categoryCards = fixture.debugElement.queryAll(By.css('.category-card'));
    expect(categoryCards.length).toBe(2);
    expect(categoryCards[0].nativeElement.textContent).toContain('Food');
    expect(categoryCards[1].nativeElement.textContent).toContain('Transport');
  });

  // Test de la navigation vers la page d'ajout de catégorie

  it('should navigate to add category page when add button is clicked', () => {
    spyOn(router, 'navigate');
    
    const addButton = fixture.debugElement.query(By.css('.btn-ajouter'));
    addButton.nativeElement.click();

    expect(router.navigate).toHaveBeenCalledWith(['/categories/add']);
  });

  // Test de la navigation vers les détails de la catégorie

  it('should navigate to category details when category is clicked', () => {
    spyOn(router, 'navigate');
    component.categories = mockCategories;
    fixture.detectChanges();

    const categoryCard = fixture.debugElement.query(By.css('.category-card'));
    categoryCard.nativeElement.click();

    expect(router.navigate).toHaveBeenCalledWith(['/categories', 1]);
  });

  // Test d'affichage des budgets associés

  it('should display budgets associated with each category', () => {
    component.categories = mockCategories;
    component.budgets = mockBudgets;
    fixture.detectChanges();

    const budgetSections = fixture.debugElement.queryAll(By.css('.budgets-section'));
    expect(budgetSections.length).toBe(2);
    
    const firstBudgetItem = budgetSections[0].query(By.css('.budget-item'));
    expect(firstBudgetItem.nativeElement.textContent).toContain('500€');
  });

  // Test de la suppression de catégorie

  it('should delete category when delete button is clicked and confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(categoryService, 'deleteCategory').and.returnValue(of(void 0));
    
    component.categories = [...mockCategories];
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('.btn-delete'));
    deleteButton.nativeElement.click();

    expect(window.confirm).toHaveBeenCalled();
    expect(categoryService.deleteCategory).toHaveBeenCalledWith(1);
    expect(component.categories.length).toBe(1);
    expect(component.categories[0].category_id).toBe(2);
  });

  // Test de l'annulation de la suppression de catégorie
  it('should not delete category when deletion is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(categoryService, 'deleteCategory');
    
    component.categories = [...mockCategories];
    const initialLength = component.categories.length;
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('.btn-delete'));
    deleteButton.nativeElement.click();

    expect(window.confirm).toHaveBeenCalled();
    expect(categoryService.deleteCategory).not.toHaveBeenCalled();
    expect(component.categories.length).toBe(initialLength);
  });
});
