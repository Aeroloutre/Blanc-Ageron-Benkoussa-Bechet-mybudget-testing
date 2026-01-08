import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface Transaction {
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
  transaction: Transaction | null = null;
  isEditing: boolean = false;
  editedTransaction: Transaction = {
    id: 0,
    libelle: '',
    type: 'retrait',
    montant: 0,
    date: new Date(),
    categoryId: 0,
    categoryName: ''
  };

  // Mock data
  private mockTransactions: Transaction[] = [
    { id: 1, libelle: 'Courses Leclerc', type: 'retrait', montant: 45.50, date: new Date('2026-01-03'), categoryId: 1, categoryName: 'Alimentation' },
    { id: 2, libelle: 'Restaurant', type: 'retrait', montant: 28.00, date: new Date('2026-01-04'), categoryId: 1, categoryName: 'Alimentation' },
    { id: 3, libelle: 'Boulangerie', type: 'retrait', montant: 12.30, date: new Date('2026-01-05'), categoryId: 1, categoryName: 'Alimentation' },
    { id: 4, libelle: 'Remboursement repas', type: 'ajout', montant: 15.00, date: new Date('2026-01-06'), categoryId: 1, categoryName: 'Alimentation' },
    { id: 5, libelle: 'Loyer janvier', type: 'retrait', montant: 650.00, date: new Date('2026-01-01'), categoryId: 2, categoryName: 'Logement' },
    { id: 6, libelle: 'Électricité', type: 'retrait', montant: 75.00, date: new Date('2026-01-02'), categoryId: 2, categoryName: 'Logement' },
    { id: 7, libelle: 'Aide au logement', type: 'ajout', montant: 200.00, date: new Date('2026-01-05'), categoryId: 2, categoryName: 'Logement' },
    { id: 8, libelle: 'Cinéma', type: 'retrait', montant: 22.00, date: new Date('2026-01-02'), categoryId: 3, categoryName: 'Loisirs' },
    { id: 9, libelle: 'Livre', type: 'retrait', montant: 18.50, date: new Date('2026-01-04'), categoryId: 3, categoryName: 'Loisirs' },
    { id: 10, libelle: 'Concert', type: 'retrait', montant: 45.00, date: new Date('2026-01-05'), categoryId: 3, categoryName: 'Loisirs' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.transaction = this.mockTransactions.find(t => t.id === id) || null;
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
      alert('Veuillez remplir tous les champs correctement');
      return;
    }
    
    // Update transaction
    this.transaction.libelle = this.editedTransaction.libelle.trim();
    this.transaction.montant = this.editedTransaction.montant;
    this.transaction.type = this.editedTransaction.type;
    
    this.isEditing = false;
    
    // TODO: Appeler le service pour sauvegarder sur le backend
    console.log('Transaction modifiée:', this.transaction);
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.transaction) {
      this.editedTransaction = { ...this.transaction };
    }
  }
}
