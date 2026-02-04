import { Component } from '@angular/core';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css']
})
export class DbComponent {
  isDeleting = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private DbService: DbService) {}

  deleteAllData(): void {
    const confirmed = confirm(
      '⚠️ ATTENTION ⚠️\n\n' +
      'Cette action va supprimer TOUTES les données de la base de données :\n' +
      '- Toutes les transactions\n' +
      '- Toutes les catégories\n' +
      '- Tous les budgets\n\n' +
      'Cette action est IRRÉVERSIBLE !\n\n' +
      'Êtes-vous absolument sûr de vouloir continuer ?'
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.message = '';
    this.messageType = '';

    this.DbService.deleteAllData().subscribe({
      next: () => {
        this.message = '✅ Toutes les données ont été supprimées avec succès';
        this.messageType = 'success';
        this.isDeleting = false;
        
        // Optionnel : recharger la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (err) => {
        this.message = '❌ Erreur lors de la suppression des données : ' + (err.error?.error || err.message);
        this.messageType = 'error';
        console.error('Erreur lors de la suppression:', err);
        this.isDeleting = false;
      }
    });
  }
}