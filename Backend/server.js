import express from 'express';
import mysql from "mysql2/promise";

const app = express();
const port = 3000;

app.use(express.json());

//Pour config la bdd -> à completer avec le .env plus tard
export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "ma_bdd",
    waitForConnections: true,
    connectionLimit: 10,
});

app.post('/transaction', async (req, res) => {
    const { montant, libelle, type, date, id_categorie } = req.body;

    if (!montant || !libelle || !type || !date || !id_categorie) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    try {
        // On insère en bdd (C'est barbare comme ligne mais bon)
        const [result] = await db.execute(`INSERT INTO transactions (montant, libelle, type, date, id_categorie) VALUES (?, ?, ?, ?, ?)`, [montant, libelle, type, date, id_categorie]);

        // On renvoi une réponse avec la transaction qui vient d'être créee
        res.status(201).json({
            id: result.insertId,
            montant,
            libelle,
            type,
            date,
            id_categorie,
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
})

app.get('/transaction', async (req, res) => {
  const { date_after, date_before } = req.query;

  try {
    let sql = "SELECT * FROM transactions WHERE 1=1";
    const params = [];

    if (date_after) {
      sql += " AND date >= ?";
      params.push(date_after);
    }

    if (date_before) {
      sql += " AND date <= ?";
      params.push(date_before);
    }

    const [rows] = await db.execute(sql, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})