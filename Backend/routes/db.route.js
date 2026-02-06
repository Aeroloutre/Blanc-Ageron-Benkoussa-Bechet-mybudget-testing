import express from "express";
import * as controller from "../controllers/db.controller.js";

const router = express.Router();

router.delete("/delete-data", controller.deleteData);
router.get("/save-data", controller.saveData);

router.get("/test", (req, res) => {
    res.json({ message: "Route database fonctionne !" });
});

export default router;