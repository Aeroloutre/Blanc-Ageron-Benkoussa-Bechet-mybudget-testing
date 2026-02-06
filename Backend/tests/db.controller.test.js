import { ZodError } from 'zod';
import { jest } from '@jest/globals';

// Mock ESM correct
jest.unstable_mockModule('../services/db.service.js', () => ({
    deleteData: jest.fn(),
    saveData: jest.fn()
}));

const dbService = await import('../services/db.service.js');
const dbController = await import('../controllers/db.controller.js');

describe('DB Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            end: jest.fn(),
            json: jest.fn(),
            download: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('deleteData', () => {
        it('devrait retourner 204 en cas de succès', async () => {
            dbService.deleteData.mockResolvedValue();

            await dbController.deleteData(req, res, next);

            expect(dbService.deleteData).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait appeler next avec l\'erreur en cas d\'échec', async () => {
            const error = new Error('Database error');
            dbService.deleteData.mockRejectedValue(error);

            await dbController.deleteData(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });
    });


    describe('saveData', () => {
        it('devrait télécharger le fichier en cas de succès', async () => {
            // Arrange
            const mockResult = {
                success: true,
                filename: 'backup_2024-01-01.json',
                path: '/app/backups/backup_2024-01-01.json',
                tables: 5,
                totalRecords: 100
            };

            jest.spyOn(dbService, 'saveData').mockResolvedValue(mockResult);
            res.download = jest.fn((path, filename, callback) => {
                callback(null);
            });

            // Act
            await dbController.saveData(req, res, next);

            // Assert
            expect(dbService.saveData).toHaveBeenCalledTimes(1);
            expect(res.download).toHaveBeenCalledWith(
                mockResult.path,
                mockResult.filename,
                expect.any(Function)
            );
        });

        it('devrait gérer les erreurs de téléchargement', async () => {
            // Arrange
            const mockResult = {
                success: true,
                filename: 'backup_2024-01-01.json',
                path: '/app/backups/backup_2024-01-01.json'
            };

            jest.spyOn(dbService, 'saveData').mockResolvedValue(mockResult);
            
            const downloadError = new Error('Download failed');
            res.download = jest.fn((path, filename, callback) => {
                callback(downloadError);
            });

            // Mock console.error pour éviter les logs pendant les tests
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act
            await dbController.saveData(req, res, next);

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Erreur lors du téléchargement:',
                downloadError
            );
            
            consoleErrorSpy.mockRestore();
        });

        it('devrait appeler next avec l\'erreur si la sauvegarde échoue', async () => {
            // Arrange
            const error = new Error('Backup failed');
            jest.spyOn(dbService, 'saveData').mockRejectedValue(error);

            // Act
            await dbController.saveData(req, res, next);

            // Assert
            expect(next).toHaveBeenCalledWith(error);
            expect(res.download).not.toHaveBeenCalled();
        });

        it('devrait retourner une erreur 500 si le téléchargement échoue et que les headers n\'ont pas été envoyés', async () => {
            // Arrange
            const mockResult = {
                success: true,
                filename: 'backup_2024-01-01.json',
                path: '/app/backups/backup_2024-01-01.json'
            };

            jest.spyOn(dbService, 'saveData').mockResolvedValue(mockResult);
            
            const downloadError = new Error('Download failed');
            res.headersSent = false;
            res.download = jest.fn((path, filename, callback) => {
                callback(downloadError);
            });

            // Mock console.error pour éviter les logs pendant les tests
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act
            await dbController.saveData(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erreur lors du téléchargement'
            });
            
            consoleErrorSpy.mockRestore();
        });

        it('ne devrait pas envoyer de réponse si les headers ont déjà été envoyés', async () => {
            // Arrange
            const mockResult = {
                success: true,
                filename: 'backup_2024-01-01.json',
                path: '/app/backups/backup_2024-01-01.json'
            };

            jest.spyOn(dbService, 'saveData').mockResolvedValue(mockResult);
            
            const downloadError = new Error('Download failed');
            res.headersSent = true;
            res.download = jest.fn((path, filename, callback) => {
                callback(downloadError);
            });

            // Mock console.error pour éviter les logs pendant les tests
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act
            await dbController.saveData(req, res, next);

            // Assert
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });
    });
});