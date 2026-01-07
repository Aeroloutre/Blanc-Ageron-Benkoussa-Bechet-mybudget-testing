import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-transactions-add',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './transactions-add.component.html',
  styleUrl: './transactions-add.component.css'
})
export class TransactionsAddComponent implements OnInit {
  transactionForm: FormGroup;
  categoryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
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
    if (this.transactionForm.valid) {
      console.log('Nouvelle transaction:', this.transactionForm.value);
      // Logique pour enregistrer la transaction (à implémenter avec le service)
      if (this.categoryId) {
        this.router.navigate(['/categories', this.categoryId]);
      }
    }
  }

  onCancel() {
    if (this.categoryId) {
      this.router.navigate(['/categories', this.categoryId]);
    }
  }
}
