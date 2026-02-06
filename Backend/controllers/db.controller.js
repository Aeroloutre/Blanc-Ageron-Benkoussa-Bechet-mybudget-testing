import { z } from "zod";
import * as service from "../services/db.service.js";
import { handleZodError } from "../helpers/handleZodError.js";
import path from 'path';


export const deleteData = async (req, res, next) => {
    try {
        await service.deleteData();
        res.status(204).end();
    } catch (err) {
        if (err instanceof z.ZodError) {
            return handleZodError(err, res);
        }
        next(err);
    }
}

export const saveData = async (req, res, next) => {
    try {
        const result = await service.saveData();
        
        // Télécharger le fichier
        res.download(result.path, result.filename, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement:', err);
                if (!res.headersSent) {
                    res.status(500).json({ 
                        success: false, 
                        message: 'Erreur lors du téléchargement' 
                    });
                }
            }
        });
        
    } catch (err) {
        if (err instanceof z.ZodError) {
            return handleZodError(err, res);
        }
        next(err);
    }
}