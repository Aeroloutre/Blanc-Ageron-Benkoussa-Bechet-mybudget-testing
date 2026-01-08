import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransactionService, Transaction } from '../../services/transaction.service';

interface TransactionDisplay {
  id: number;
  libelle: string;
  type: 'ajout' | 'retrait';
  montant: number;
  date: Date;
  categoryId: number;
  categoryName: string;
}

@Component({
  selector: 'app-transactions-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './transactions-details.component.html',
  styleUrl: './transactions-details.component.css'
})
export class TransactionsDetailsComponent implements OnInit {
  transaction: TransactionDisplay | null = null;
  isEditing: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  editedTransaction: TransactionDisplay = {
    id: 0,
    libelle: '',
    type: 'retrait',
    montant: 0,
    date: new Date(),
    categoryId: 0,
    categoryName: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTransaction(id);
  }

  loadTransaction(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.transactionService.getTransactionById(id).subscribe({
      next: (transaction) => {
        this.transaction = {
          id: transaction.transaction_id!,
          libelle: transaction.label || '',
          type: transaction.type === 'expense' ? 'retrait' : 'ajout',
          montant: transaction.amount,
          date: new Date(transaction.transaction_date),
          categoryId: transaction.category_id || 0,
          categoryName: transaction.category_label || ''
        };
        this.editedTransaction = { ...this.transaction };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
        this.errorMessage = 'Impossible de charger la transaction';
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    if (!this.transaction) return;
    
    if (!this.isEditing) {
      this.isEditing = true;
      // Copy transaction data to editedTransaction
      this.editedTransaction = { ...this.transaction };
    } else {
      this.saveTransaction();
    }
  }

  saveTransaction(): void {
    if (!this.transaction || !this.editedTransaction.libelle.trim() || this.editedTransaction.montant <= 0) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    const updatedTransaction: Partial<Transaction> = {
      label: this.editedTransaction.libelle.trim(),
      amount: this.editedTransaction.montant,
      type: this.editedTransaction.type === 'retrait' ? 'expense' : 'income'
    };
    
    this.transactionService.updateTransaction(this.transaction.id, updatedTransaction).subscribe({
      next: (transaction) => {
        this.transaction!.libelle = this.editedTransaction.libelle.trim();
        this.transaction!.montant = this.editedTransaction.montant;
        this.transaction!.type = this.editedTransaction.type;
        this.isEditing = false;
        this.isLoading = false;
        console.log('Transaction modifiée:', transaction);
      },
      error: (error) => {
        console.error('Error updating transaction:', error);
        this.errorMessage = 'Erreur lors de la modification';
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.transaction) {
      this.editedTransaction = { ...this.transaction };
    }
  }
}
