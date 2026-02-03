import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const DB_CONFIG = {
  containerName: 'mybudget-postgres',
  username: 'user',
  database: 'mybudget'
};

describe('DatabaseIntegration', () => {
  describe('Connectivity', () => {
    test('La base de données est accessible', async () => {
      const cmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "SELECT 1;"`;
      
      const { stdout, stderr } = await execPromise(cmd);
      
      expect(stdout).toBeDefined();
      expect(stderr).toBe('');
      expect(stdout.trim()).toBe('1');
    });

    test('La table transactions existe', async () => {
      const cmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'transactions';"`;
      
      const { stdout } = await execPromise(cmd);
      
      expect(stdout).toBeDefined();
      expect(parseInt(stdout.trim())).toBe(1);
    });
  });

  describe('DataIntegrity', () => {
    test('Comptage des transactions', async () => {
      const cmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "SELECT COUNT(*) FROM transactions;"`;
      
      const { stdout } = await execPromise(cmd);
      
      expect(stdout).toBeDefined();
      const count = parseInt(stdout.trim());
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Structure de la table transactions', async () => {
      const cmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position;"`;
      
      const { stdout } = await execPromise(cmd);
      
      expect(stdout).toBeDefined();
      const columns = stdout.trim().split('\n').map(col => col.trim()).filter(col => col);
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
      const cmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "SELECT COUNT(*) FROM transactions;"`;
      
      await execPromise(cmd);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(5000);
    });
  });

  describe('ErrorScenarios', () => {
    test('Requête invalide', async () => {
      const invalidCmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "SELECT * FROM nonexistent_table;"`;
      
      await expect(execPromise(invalidCmd)).rejects.toThrow();
    });

    test('Base de données inexistante', async () => {
      const invalidCmd = `docker exec ${DB_CONFIG.containerName} psql -U ${DB_CONFIG.username} -d nonexistent_db -t -c "SELECT 1;"`;
      
      await expect(execPromise(invalidCmd)).rejects.toThrow();
    });
  });
});