import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-transactions-add',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './transactions-add.component.html',
  styleUrl: './transactions-add.component.css'
})
export class TransactionsAddComponent implements OnInit {
  transactionForm: FormGroup;
  categoryId: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService
  ) {
    this.transactionForm = this.fb.group({
      libelle: ['', [Validators.required, Validators.minLength(2)]],
      type: ['retrait', Validators.required],
      montant: [0, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
  }

  onSubmit() {
    if (this.transactionForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = null;

      const formValue = this.transactionForm.value;
      const transaction: Transaction = {
        amount: formValue.montant,
        label: formValue.libelle,
        type: formValue.type === 'retrait' ? 'expense' : 'income',
        transaction_date: formValue.date,
        category_id: this.categoryId || undefined
      };

      this.transactionService.createTransaction(transaction).subscribe({
        next: (createdTransaction) => {
          console.log('Transaction created:', createdTransaction);
          this.isLoading = false;
          if (this.categoryId) {
            this.router.navigate(['/categories', this.categoryId]);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Une erreur est survenue lors de la création de la transaction';
        }
      });
    }
  }

  onCancel() {
    if (this.categoryId) {
      this.router.navigate(['/categories', this.categoryId]);
    }
  }
}
