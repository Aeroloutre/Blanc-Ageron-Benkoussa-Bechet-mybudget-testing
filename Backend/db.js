import mysql from "mysql2/promise";
import "dotenv/config";

// Pour la config de la bdd
export const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "ma_bdd",
    waitForConnections: true,
    connectionLimit: 10,
});
