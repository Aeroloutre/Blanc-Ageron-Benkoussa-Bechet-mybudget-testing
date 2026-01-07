import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

describe('Test BDD Réelle', () => {
  
  test('La base de données fonctionne', async () => {
    // Compte le nombre de transactions dans la BDD
    const cmd = `docker exec mybudget-postgres psql -U user -d mybudget -t -c "SELECT COUNT(*) FROM transactions;"`;
    
    const { stdout } = await execPromise(cmd);
    
    // Vérifie juste que la BDD répond (pas d'erreur)
    expect(stdout).toBeDefined();
  });
});
