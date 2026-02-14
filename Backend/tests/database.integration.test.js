import { db } from '../db.js';

describe('DatabaseIntegration', () => {
  describe('Connectivity', () => {
    test('La base de données est accessible', async () => {
      const { rows } = await db.query('SELECT 1 as result');
      
      expect(rows).toBeDefined();
      expect(rows.length).toBe(1);
      expect(rows[0].result).toBe(1);
    });

    test('La table transactions existe', async () => {
      const { rows } = await db.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'transactions'"
      );
      
      expect(rows).toBeDefined();
      expect(parseInt(rows[0].count)).toBe(1);
    });
  });

  describe('DataIntegrity', () => {
    test('Comptage des transactions', async () => {
      const { rows } = await db.query('SELECT COUNT(*) as count FROM transactions');
      
      expect(rows).toBeDefined();
      const count = parseInt(rows[0].count);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Structure de la table transactions', async () => {
      const { rows } = await db.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position"
      );
      
      expect(rows).toBeDefined();
      const columns = rows.map(row => row.column_name);
      expect(columns).toContain('transaction_id');
      expect(columns).toContain('amount');
      expect(columns).toContain('label');
      expect(columns).toContain('type');
      expect(columns).toContain('transaction_date');
      expect(columns).toContain('category_id');
    });
  });

  describe('Performance', () => {
    test('Temps d\'exécution des requêtes', async () => {
      const startTime = Date.now();
      await db.query('SELECT COUNT(*) FROM transactions');
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(5000);
    });
  });

  describe('ErrorScenarios', () => {
    test('Requête invalide', async () => {
      await expect(db.query('SELECT * FROM nonexistent_table')).rejects.toThrow();
    });

    test('Connexion valide avec table inexistante dans schéma', async () => {
      // Test qu'une requête SQL valide sur une table inexistante échoue correctement
      const { rows } = await db.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'nonexistent_db_table'"
      );
      expect(parseInt(rows[0].count)).toBe(0);
    });
  });
});