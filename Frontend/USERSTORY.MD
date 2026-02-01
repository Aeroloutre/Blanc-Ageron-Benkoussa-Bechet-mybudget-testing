# User Stories - MyBudget Frontend

## US1 : Affichage et filtrage des transactions

**En tant qu'** utilisateur  
**Je veux** visualiser et filtrer mes transactions  
**Afin de** mieux analyser mes dépenses et revenus

### Critères d'acceptation

Critère 1:  Tableau avec montant, libellé, type, catégorie, date |
Critère 2: Revenus en vert, dépenses en rouge |
Critère 3: Filtre par période (date début/fin) |
Critère 4: Filtre par catégorie (menu déroulant) |
Critère 5: Filtre par type (revenus/dépenses/tous) |
Critère 6: Filtres en temps réel sans rechargement |
Critère 7: Affichage du total et du solde |
Critère 8: Message si aucun résultat |

### Scénarios

**Consultation globale**
- Accès page "Transactions" → Tableau trié par date + "X transactions | Solde : Y €"

**Filtrage par catégorie**
- Sélection "Alimentation" → Affichage transactions de cette catégorie uniquement

**Combinaison filtres**
- Période "Janvier 2026" + Catégorie "Alimentation" → Résultats combinés

---

## US2 : Ajout de transaction

**En tant qu'** utilisateur  
**Je veux** ajouter une transaction via un formulaire  
**Afin de** enregistrer rapidement mes revenus et dépenses

### Critères d'acceptation


Critère 1: Bouton "+ Nouvelle transaction" accessible |
Critère 2: Montant : numérique, obligatoire, > 0 |
Critère 3: Libellé : texte, obligatoire, 3-100 caractères |
Critère 4: Type : radio/toggle "Revenu" ou "Dépense" (défaut: Dépense) |
Critère 5: Catégorie : menu déroulant, obligatoire |
Critère 6: Date : date picker, obligatoire, défaut aujourd'hui, pas future |
Critère 7: Validation en temps réel avec messages d'erreur |
Critère 8: Bouton "Enregistrer" désactivé si formulaire invalide |
Critère 9: Message de confirmation + redirection après enregistrement |
Critère 10 Bouton "Annuler" pour fermer sans sauvegarder |
Critère 11: Gestion des erreurs serveur avec message explicite |

### Scénario nominal

1. Utilisateur clique "+ Nouvelle transaction"
2. Saisit : Montant (45.80), Libellé (Courses), Type (Dépense), Catégorie (Alimentation), Date (aujourd'hui)
3. Clique "Enregistrer"
4. Message de confirmation → Redirection → Transaction visible dans le tableau

### Cas d'erreur

- Montant négatif/vide → "Le montant doit être un nombre positif"
- Libellé < 3 caractères → "Minimum 3 caractères"
- Bouton "Enregistrer" reste désactivé

---

