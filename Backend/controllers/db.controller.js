import { z } from "zod";
import * as service from "../services/db.service.js";
import { handleZodError } from "../helpers/handleZodError.js";


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

