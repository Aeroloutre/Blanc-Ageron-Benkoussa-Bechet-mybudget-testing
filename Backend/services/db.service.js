import db from "../db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

export const deleteData = async () => {
    await db.query(
        `DO $$ 
        DECLARE 
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
            LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
            END LOOP;
        END $$;`
    )
}

export const saveData = async () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.json`;
        const backupPath = path.join(backupDir, filename);
        
        console.log('📦 Création de la sauvegarde JSON...');
        
        // Récupérer toutes les tables
        const tablesResult = await db.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        
        const backup = {
            metadata: {
                created_at: new Date().toISOString(),
                database: process.env.DB_NAME || 'mybudget',
                version: '1.0'
            },
            tables: {}
        };
        
        // Pour chaque table, récupérer les données
        for (const row of tablesResult.rows) {
            const tableName = row.tablename;
            const dataResult = await db.query(`SELECT * FROM ${tableName}`);
            backup.tables[tableName] = dataResult.rows;
        }
        
        // Écrire dans un fichier JSON
        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
        
        console.log('✅ Sauvegarde JSON créée:', backupPath);
        
        return {
            success: true,
            filename: filename,
            path: backupPath,
            message: 'Sauvegarde JSON créée avec succès',
            timestamp: new Date().toISOString(),
            tables: Object.keys(backup.tables).length,
            totalRecords: Object.values(backup.tables).reduce((sum, records) => sum + records.length, 0)
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        throw new Error(`Erreur de sauvegarde: ${error.message}`);
    }
};