import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface Transaction {
  id: number;
  libelle: string;
  type: 'ajout' | 'retrait';
  montant: number;
  date: Date;
}

interface Category {
  id: number;
  nom: string;
  budget: number;
  transactions: Transaction[];
}

@Component({
  selector: 'app-categories-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './categories-details.component.html',
  styleUrl: './categories-details.component.css'
})
export class CategoriesDetailsComponent implements OnInit {
  category: Category | null = null;
  totalAjouts: number = 0;
  totalRetraits: number = 0;
  solde: number = 0;
  isEditingName: boolean = false;
  editedName: string = '';
  
  @ViewChild('nameInput') nameInput!: ElementRef;

  // Mock data - à remplacer par un appel au service plus tard
  private mockCategories: Category[] = [
    {
      id: 1,
      nom: 'Alimentation',
      budget: 300,
      transactions: [
        { id: 1, libelle: 'Courses Leclerc', type: 'retrait', montant: 45.50, date: new Date('2026-01-03') },
        { id: 2, libelle: 'Restaurant', type: 'retrait', montant: 28.00, date: new Date('2026-01-04') },
        { id: 3, libelle: 'Boulangerie', type: 'retrait', montant: 12.30, date: new Date('2026-01-05') },
        { id: 4, libelle: 'Remboursement repas', type: 'ajout', montant: 15.00, date: new Date('2026-01-06') }
      ]
    },
    {
      id: 2,
      nom: 'Logement',
      budget: 800,
      transactions: [
        { id: 5, libelle: 'Loyer janvier', type: 'retrait', montant: 650.00, date: new Date('2026-01-01') },
        { id: 6, libelle: 'Électricité', type: 'retrait', montant: 75.00, date: new Date('2026-01-02') },
        { id: 7, libelle: 'Aide au logement', type: 'ajout', montant: 200.00, date: new Date('2026-01-05') }
      ]
    },
    {
      id: 3,
      nom: 'Loisirs',
      budget: 150,
      transactions: [
        { id: 8, libelle: 'Cinéma', type: 'retrait', montant: 22.00, date: new Date('2026-01-02') },
        { id: 9, libelle: 'Livre', type: 'retrait', montant: 18.50, date: new Date('2026-01-04') },
        { id: 10, libelle: 'Concert', type: 'retrait', montant: 45.00, date: new Date('2026-01-05') }
      ]
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('categoryId'));
    this.category = this.mockCategories.find(c => c.id === id) || null;
    
    if (this.category) {
      this.calculateTotals();
    }
  }

  calculateTotals(): void {
    if (!this.category) return;
    
    this.totalAjouts = this.category.transactions
      .filter(t => t.type === 'ajout')
      .reduce((sum, t) => sum + t.montant, 0);
    
    this.totalRetraits = this.category.transactions
      .filter(t => t.type === 'retrait')
      .reduce((sum, t) => sum + t.montant, 0);
    
    this.solde = this.totalAjouts - this.totalRetraits;
  }

  ajouterTransaction() {
    if (this.category) {
      this.router.navigate(['/categories', this.category.id, 'transactions', 'add']);
    }
  }

  voirDetailsTransaction(transactionId: number) {
    this.router.navigate(['/transactions', transactionId]);
  }

  toggleEditName(): void {
    if (!this.category) return;
    
    if (!this.isEditingName) {
      this.isEditingName = true;
      this.editedName = this.category.nom;
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
    
    // Update category name
    this.category.nom = this.editedName.trim();
    this.isEditingName = false;
    
    // TODO: Appeler le service pour sauvegarder sur le backend
    console.log('Nom de la catégorie modifié:', this.category.nom);
  }

  cancelEdit(): void {
    this.isEditingName = false;
    if (this.category) {
      this.editedName = this.category.nom;
    }
  }

  supprimerTransaction(transactionId: number, event: Event): void {
    event.stopPropagation(); // Prevent card click event
    
    if (!this.category) return;
    
    const transaction = this.category.transactions.find(t => t.id === transactionId);
    if (transaction && confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.libelle}" ?`)) {
      this.category.transactions = this.category.transactions.filter(t => t.id !== transactionId);
      
      // Recalculate totals after deletion
      this.calculateTotals();
      
      // TODO: Appeler le service pour supprimer sur le backend
      console.log('Transaction supprimée:', transactionId);
    }
  }
}
