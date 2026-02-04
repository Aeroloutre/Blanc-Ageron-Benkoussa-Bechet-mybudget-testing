import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { TransactionService, Transaction } from '../../services/transaction.service';
import { BudgetService, Budget } from '../../services/budget.service';

@Component({
  selector: 'app-categories-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './categories-details.component.html',
  styleUrl: './categories-details.component.css'
})
export class CategoriesDetailsComponent implements OnInit {
  category: Category | null = null;
  budget: Budget | null = null;
  transactions: Transaction[] = [];
  totalAjouts: number = 0;
  totalRetraits: number = 0;
  solde: number = 0;
  isEditingName: boolean = false;
  editedName: string = '';
  isEditingBudget: boolean = false;
  editedBudgetAmount: number = 0;
  editedPeriodStart: string = '';
  editedPeriodEnd: string = '';
  loading = false;
  error: string | null = null;
  
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('budgetInput') budgetInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private transactionService: TransactionService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('categoryId'));
    this.loadCategoryAndTransactions(id);
  }

  loadCategoryAndTransactions(categoryId: number): void {
    this.loading = true;
    this.error = null;

    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        this.loadBudget(categoryId);
        this.loadTransactions(categoryId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la catégorie:', error);
        this.error = 'Impossible de charger la catégorie.';
        this.loading = false;
      }
    });
  }

  loadBudget(categoryId: number): void {
    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        const categoryBudgets = budgets.filter(b => b.category_id === categoryId);
        if (categoryBudgets.length > 0) {
          this.budget = categoryBudgets.sort((a, b) => 
            new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
          )[0];
          // Recalculer le solde avec le budget
          this.calculateTotals();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du budget:', error);
      }
    });
  }

  loadTransactions(categoryId: number): void {
    this.transactionService.getTransactions({ category_id: categoryId }).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateTotals();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des transactions:', error);
        this.error = 'Impossible de charger les transactions.';
        this.loading = false;
      }
    });
  }

  calculateTotals(): void {
    this.totalAjouts = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    this.totalRetraits = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    if (this.budget) {
      this.solde = Number(this.budget.allocated_amount) - this.totalRetraits;
    } else {
      this.solde = this.totalAjouts - this.totalRetraits;
    }
  }

  addTransaction() {
    if (this.category) {
      this.router.navigate(['/categories', this.category.category_id, 'transactions', 'add']);
    }
  }

  seeDetailsTransaction(transactionId: number) {
    this.router.navigate(['/transactions', transactionId]);
  }

  toggleEditName(): void {
    if (!this.category) return;
    
    if (!this.isEditingName) {
      this.isEditingName = true;
      this.editedName = this.category.label;
      // Focus input after view update
      setTimeout(() => {
        if (this.nameInput) {
          this.nameInput.nativeElement.focus();
          this.nameInput.nativeElement.select();
        }
      });
    } else {
      this.saveCategoryName();
    }
  }

  saveCategoryName(): void {
    if (!this.category || !this.editedName.trim()) {
      this.cancelEdit();
      return;
    }
    
    const categoryId = this.category.category_id!;
    this.categoryService.updateCategory(categoryId, { label: this.editedName.trim() }).subscribe({
      next: (updatedCategory) => {
        this.category = updatedCategory;
        this.isEditingName = false;
        console.log('Nom de la catégorie modifié:', updatedCategory.label);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        alert('Impossible de modifier le nom de la catégorie.');
        this.cancelEdit();
      }
    });
  }

  cancelEdit(): void {
    this.isEditingName = false;
    if (this.category) {
      this.editedName = this.category.label;
    }
  }

  supprimerTransaction(transactionId: number, event: Event): void {
    event.stopPropagation();
    
    const transaction = this.transactions.find(t => t.transaction_id === transactionId);
    if (transaction && confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.label}" ?`)) {
      this.transactionService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.transaction_id !== transactionId);
          this.calculateTotals();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Impossible de supprimer la transaction.');
        }
      });
    }
  }

  toggleEditBudget(): void {
    if (!this.isEditingBudget) {
      this.isEditingBudget = true;
      
      // Si un budget existe, charger ses valeurs
      if (this.budget) {
        this.editedBudgetAmount = Number(this.budget.allocated_amount);
        this.editedPeriodStart = this.formatDateForInput(this.budget.period_start);
        this.editedPeriodEnd = this.formatDateForInput(this.budget.period_end);
      } else {
        // Sinon, initialiser avec des valeurs par défaut
        this.editedBudgetAmount = 0;
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        this.editedPeriodStart = this.formatDateForInput(today.toISOString());
        this.editedPeriodEnd = this.formatDateForInput(nextMonth.toISOString());
      }
      
      setTimeout(() => {
        if (this.budgetInput) {
          this.budgetInput.nativeElement.focus();
          this.budgetInput.nativeElement.select();
        }
      });
    } else {
      this.saveBudget();
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  saveBudget(): void {
    if (!this.editedBudgetAmount || this.editedBudgetAmount <= 0) {
      alert('Veuillez entrer un montant valide.');
      return;
    }

    if (!this.editedPeriodStart || !this.editedPeriodEnd) {
      alert('Veuillez sélectionner les dates de début et de fin.');
      return;
    }
    
    // Mode création : créer un nouveau budget
    if (!this.budget) {
      if (!this.category) return;
      
      const newBudget: Budget = {
        category_id: this.category.category_id!,
        allocated_amount: this.editedBudgetAmount,
        period_start: this.editedPeriodStart,
        period_end: this.editedPeriodEnd
      };

      this.budgetService.createBudget(newBudget).subscribe({
        next: (created) => {
          this.budget = created;
          this.isEditingBudget = false;
          this.calculateTotals(); // Recalculer avec le nouveau budget
          console.log('Budget créé:', created);
        },
        error: (error) => {
          console.error('Erreur lors de la création du budget:', error);
          alert('Impossible de créer le budget.');
        }
      });
    }
    // Mode modification : mettre à jour le budget existant
    else {
      const budgetId = this.budget.budget_id!;
      const updatedBudget = {
        allocated_amount: this.editedBudgetAmount,
        period_start: this.editedPeriodStart,
        period_end: this.editedPeriodEnd
      };

      this.budgetService.updateBudget(budgetId, updatedBudget).subscribe({
        next: (updated) => {
          this.budget = updated;
          this.isEditingBudget = false;
          this.calculateTotals(); // Recalculer avec le budget mis à jour
          console.log('Budget modifié:', updated);
        },
        error: (error) => {
          console.error('Erreur lors de la modification du budget:', error);
          alert('Impossible de modifier le budget.');
        }
      });
    }
  }

  cancelEditBudget(): void {
    this.isEditingBudget = false;
    // Réinitialiser les valeurs uniquement si un budget existe
    if (this.budget) {
      this.editedBudgetAmount = Number(this.budget.allocated_amount);
      this.editedPeriodStart = this.formatDateForInput(this.budget.period_start);
      this.editedPeriodEnd = this.formatDateForInput(this.budget.period_end);
    } else {
      // Réinitialiser à zéro si pas de budget
      this.editedBudgetAmount = 0;
      this.editedPeriodStart = '';
      this.editedPeriodEnd = '';
    }
  }
}
