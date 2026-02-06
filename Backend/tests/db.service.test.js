import * as dbService from '../services/db.service.js';
import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';


// Mock des dépendances
jest.mock('../db.js');
jest.mock('fs');

describe('DB Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('deleteData', () => {
        it('devrait exécuter la requête de truncate pour toutes les tables', async () => {
            // Arrange
            const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
            db.query = mockQuery;

            // Act
            await dbService.deleteData();

            // Assert
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('TRUNCATE TABLE')
            );
        });

        it('devrait propager les erreurs de la base de données', async () => {
            // Arrange
            const mockError = new Error('Database connection failed');
            db.query = jest.fn().mockRejectedValue(mockError);

            // Act & Assert
            await expect(dbService.deleteData()).rejects.toThrow('Database connection failed');
        });
    });

    describe('saveData', () => {
        beforeEach(() => {
            // Mock fs.existsSync
            fs.existsSync = jest.fn().mockReturnValue(true);
            // Mock fs.mkdirSync
            fs.mkdirSync = jest.fn();
            // Mock fs.writeFileSync
            fs.writeFileSync = jest.fn();
        });

        it('devrait créer une sauvegarde JSON avec succès', async () => {
            // Arrange
            const mockTables = {
                rows: [
                    { tablename: 'users' },
                    { tablename: 'transactions' }
                ]
            };

            const mockUsersData = {
                rows: [
                    { id: 1, name: 'John' },
                    { id: 2, name: 'Jane' }
                ]
            };

            const mockTransactionsData = {
                rows: [
                    { id: 1, amount: 100 }
                ]
            };

            db.query = jest.fn()
                .mockResolvedValueOnce(mockTables)
                .mockResolvedValueOnce(mockUsersData)
                .mockResolvedValueOnce(mockTransactionsData);

            // Act
            const result = await dbService.saveData();

            // Assert
            expect(result.success).toBe(true);
            expect(result.filename).toMatch(/^backup_.*\.json$/);
            expect(result.tables).toBe(2);
            expect(result.totalRecords).toBe(3);
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledTimes(3);
        });

        it('devrait utiliser le dossier backups pour sauvegarder', async () => {
            // Arrange
            db.query = jest.fn().mockResolvedValue({ rows: [] });

            // Act
            const result = await dbService.saveData();

            // Assert
            expect(result.path).toContain('backups');
            expect(result.path).toContain('.json');
        });

        it('devrait appeler writeFileSync avec le bon chemin', async () => {
            // Arrange
            db.query = jest.fn().mockResolvedValue({ rows: [] });

            // Act
            await dbService.saveData();

            // Assert
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.stringContaining('backups'),
                expect.any(String),
                'utf8'
            );
        });

        it('devrait sauvegarder les métadonnées correctement', async () => {
            // Arrange
            process.env.DB_NAME = 'test_database';
            
            db.query = jest.fn()
                .mockResolvedValueOnce({ rows: [{ tablename: 'users' }] })
                .mockResolvedValueOnce({ rows: [] });

            // Act
            const result = await dbService.saveData();

            // Assert
            const writeCall = fs.writeFileSync.mock.calls[0];
            const savedData = JSON.parse(writeCall[1]);
            
            expect(savedData.metadata).toBeDefined();
            expect(savedData.metadata.database).toBe('test_database');
            expect(savedData.metadata.version).toBe('1.0');
            expect(savedData.metadata.created_at).toBeDefined();
        });

        it('devrait gérer les tables vides', async () => {
            // Arrange
            db.query = jest.fn()
                .mockResolvedValueOnce({ 
                    rows: [
                        { tablename: 'empty_table' }
                    ] 
                })
                .mockResolvedValueOnce({ rows: [] });

            // Act
            const result = await dbService.saveData();

            // Assert
            expect(result.success).toBe(true);
            expect(result.totalRecords).toBe(0);
            expect(result.tables).toBe(1);
        });

        it('devrait lancer une erreur si la requête échoue', async () => {
            // Arrange
            const mockError = new Error('Query failed');
            db.query = jest.fn().mockRejectedValue(mockError);

            // Mock console.error pour éviter les logs pendant les tests
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act & Assert
            await expect(dbService.saveData()).rejects.toThrow('Erreur de sauvegarde: Query failed');
            
            // Vérifier que l'erreur a été loggée
            expect(consoleErrorSpy).toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });

        it('devrait lancer une erreur si l\'écriture du fichier échoue', async () => {
            // Arrange
            db.query = jest.fn()
                .mockResolvedValueOnce({ rows: [{ tablename: 'users' }] })
                .mockResolvedValueOnce({ rows: [{ id: 1 }] });

            fs.writeFileSync = jest.fn(() => {
                throw new Error('Cannot write file');
            });

            // Mock console.error pour éviter les logs pendant les tests
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act & Assert
            await expect(dbService.saveData()).rejects.toThrow('Erreur de sauvegarde: Cannot write file');
            
            // Vérifier que l'erreur a été loggée
            expect(consoleErrorSpy).toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });

        it('devrait formater le timestamp correctement dans le nom du fichier', async () => {
            // Arrange
            db.query = jest.fn()
                .mockResolvedValueOnce({ rows: [] });

            // Act
            const result = await dbService.saveData();

            // Assert
            expect(result.filename).toMatch(/^backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/);
        });

        it('devrait inclure le nombre total d\'enregistrements', async () => {
            // Arrange
            db.query = jest.fn()
                .mockResolvedValueOnce({ 
                    rows: [
                        { tablename: 'users' },
                        { tablename: 'transactions' }
                    ] 
                })
                .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }, { id: 3 }] })
                .mockResolvedValueOnce({ rows: [{ id: 1 }] });

            // Act
            const result = await dbService.saveData();

            // Assert
            expect(result.totalRecords).toBe(4);
        });

        it('devrait sauvegarder toutes les tables dans l\'objet tables', async () => {
            // Arrange
            db.query = jest.fn()
                .mockResolvedValueOnce({ 
                    rows: [
                        { tablename: 'categories' },
                        { tablename: 'budgets' }
                    ] 
                })
                .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Food' }] })
                .mockResolvedValueOnce({ rows: [{ id: 1, amount: 500 }] });

            // Act
            await dbService.saveData();

            // Assert
            const writeCall = fs.writeFileSync.mock.calls[0];
            const savedData = JSON.parse(writeCall[1]);
            
            expect(savedData.tables).toHaveProperty('categories');
            expect(savedData.tables).toHaveProperty('budgets');
            expect(savedData.tables.categories).toHaveLength(1);
            expect(savedData.tables.budgets).toHaveLength(1);
        });

        it('devrait retourner le bon timestamp', async () => {
            // Arrange
            const beforeTest = new Date();
            db.query = jest.fn().mockResolvedValue({ rows: [] });

            // Act
            const result = await dbService.saveData();
            const afterTest = new Date();

            // Assert
            const resultTimestamp = new Date(result.timestamp);
            expect(resultTimestamp.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
            expect(resultTimestamp.getTime()).toBeLessThanOrEqual(afterTest.getTime());
        });
    });
});