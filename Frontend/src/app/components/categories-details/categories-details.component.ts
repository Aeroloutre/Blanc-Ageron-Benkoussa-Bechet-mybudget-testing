import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-categories-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './categories-details.component.html',
  styleUrl: './categories-details.component.css'
})
export class CategoriesDetailsComponent implements OnInit {
  category: Category | null = null;
  transactions: Transaction[] = [];
  totalAjouts: number = 0;
  totalRetraits: number = 0;
  solde: number = 0;
  isEditingName: boolean = false;
  editedName: string = '';
  loading = false;
  error: string | null = null;
  
  @ViewChild('nameInput') nameInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('categoryId'));
    this.loadCategoryAndTransactions(id);
  }

  loadCategoryAndTransactions(categoryId: number): void {
    this.loading = true;
    this.error = null;

    // Load category
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        // Load transactions for this category
        this.loadTransactions(categoryId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la catégorie:', error);
        this.error = 'Impossible de charger la catégorie.';
        this.loading = false;
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
    
    this.solde = this.totalAjouts - this.totalRetraits;
  }

  ajouterTransaction() {
    if (this.category) {
      this.router.navigate(['/categories', this.category.category_id, 'transactions', 'add']);
    }
  }

  voirDetailsTransaction(transactionId: number) {
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
          console.log('Transaction supprimée:', transactionId);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Impossible de supprimer la transaction.');
        }
      });
    }
  }
}
