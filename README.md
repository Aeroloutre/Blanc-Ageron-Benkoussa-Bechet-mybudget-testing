# BudgetPerso-MAMV
Sujet Projet Budget Personnel -> Cours "Tests" -> Mathilde Massine Alexandre Victor

# Pour lancer le backend :

- Créer un .env à la racine du projet avec :

DB_HOST=db

DB_PORT=5432

DB_USER=user

DB_PASSWORD=user-pwd

DB_NAME=mybudget

- Lancer la commande docker compose up (avec docker desktop ouvert)

- Tester la connexion avec http://localhost:3000/health/db -> ok true now "Date actuelle"

- En cas de problème, rebuild le conteneur avec :

docker compose down -v
docker compose --build

# Structure du backend :

Le backend est composé de 6 éléments :

- Le dossier routes -> Exposent les routes de l'API.

- Le dossier controllers -> Gèrent l'arrivée des requètent, le formattage, gère les 
erreurs, puis appelle le service associé.

- Le dossier services -> Gère la logique métier et les opérations SQL.

- Le dossier middlewares -> Contient du code qui s'exécute entre les routes (uniquement de la gestion d'erreur centralisée actuellement).

- Les fichier app.js et server.js -> servent à la config du serveur.

- Le fichier db.js -> Sert pour la config de la base de données.