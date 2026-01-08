import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  categories = [
    { id: 1, nom: 'Alimentation', budget: 300, depense: 250 },
    { id: 2, nom: 'Logement', budget: 800, depense: 800 },
    { id: 3, nom: 'Loisirs', budget: 150, depense: 80 },
    { id: 4, nom: 'Transports', budget: 200, depense: 120 }
  ];

  constructor(private router: Router) {}

  ajouterCategorie() {
    this.router.navigate(['/categories/add']);
  }

  voirDetails(id: number) {
    this.router.navigate(['/categories', id]);
  }

  supprimerCategorie(id: number, event: Event) {
    event.stopPropagation(); // Prevent card click event
    
    const category = this.categories.find(c => c.id === id);
    if (category && confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.nom}" ?`)) {
      this.categories = this.categories.filter(c => c.id !== id);
      
      // TODO: Appeler le service pour supprimer sur le backend
      console.log('Catégorie supprimée:', id);
    }
  }
}
