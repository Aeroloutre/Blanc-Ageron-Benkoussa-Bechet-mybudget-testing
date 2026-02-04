import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { BudgetService, Budget } from '../../services/budget.service';
import { forkJoin } from 'rxjs';
import { DbComponent } from "../db/db.component";

@Component({
  selector: 'app-categories',
  imports: [CommonModule, DbComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  budgets: Budget[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    console.log('[CategoriesComponent] Starting to load categories...');
    this.loading = true;
    this.error = null;
    
    forkJoin({
      categories: this.categoryService.getCategories(),
      budgets: this.budgetService.getBudgets()
    }).subscribe({
      next: ({ categories, budgets }) => {
        console.log('[CategoriesComponent] Categories loaded successfully:', categories);
        console.log('[CategoriesComponent] Budgets loaded successfully:', budgets);
        this.categories = categories;
        this.budgets = budgets;
        this.loading = false;
      },
      error: (error) => {
        console.error('[CategoriesComponent] Error loading categories:');
        console.error('  Status:', error.status);
        console.error('  Status Text:', error.statusText);
        console.error('  URL:', error.url);
        console.error('  Error:', error.error);
        console.error('  Full error object:', error);
        this.error = 'Impossible de charger les catégories. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  getBudgetsForCategory(categoryId: number): Budget[] {
    return this.budgets.filter(b => b.category_id === categoryId);
  }

  addCategory() {
    this.router.navigate(['/categories/add']);
  }

  seeDetails(id: number) {
    this.router.navigate(['/categories', id]);
  }

  deleteCategory(id: number, event: Event) {
    event.stopPropagation();
    
    const category = this.categories.find(c => c.category_id === id);
    if (category && confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.label}" ?`)) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.category_id !== id);
          console.log('Catégorie supprimée:', id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Impossible de supprimer la catégorie. Veuillez réessayer.');
        }
      });
    }
  }
}
