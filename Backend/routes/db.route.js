import express from "express";
import * as controller from "../controllers/db.controller.js";

const router = express.Router();

router.delete("/delete-data", controller.deleteData);

export default router;