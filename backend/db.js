const mysql = require("mysql2/promise");
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
require("dotenv").config();

let isMySql = false;
let mysqlPool;
let sqliteDbPromise;

if (process.env.DB_HOST && process.env.DB_USER) {
    isMySql = true;
    mysqlPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log("Using MySQL Database");
} else {
    console.log("No MySQL .env found. Falling back to SQLite (featureiq.db)");
    sqliteDbPromise = open({
      filename: path.join(__dirname, '..', 'analysis', 'featureiq.db'),
      driver: sqlite3.Database
    });
}

// Wrapper to make SQLite behave like mysql2/promise `[rows] = await pool.query(...)`
const poolWrapper = {
    query: async (sql, params = []) => {
        if (isMySql) {
            return mysqlPool.query(sql, params);
        } else {
            const db = await sqliteDbPromise;

            // Basic rewrite for test queries
            if (sql.trim().toUpperCase().startsWith("SELECT 1 AS connected")) {
                const row = await db.get(sql, params);
                return [[row]];
            }

            // Map Node.js 'feature_usage' table name to Python's 'usage' table name
            let adjustedSql = sql.replace(/FROM feature_usage/gi, "FROM usage");

            const rows = await db.all(adjustedSql, params);
            return [rows]; // Return inside an array to match [rows] destructuring
        }
    },
    getConnection: async () => {
        if (isMySql) {
            return mysqlPool.getConnection();
        }
        throw new Error("getConnection() wrapper not implemented for SQLite seeding.");
    },
    end: async () => {
        if (isMySql) return mysqlPool.end();
        const db = await sqliteDbPromise;
        return db.close();
    }
};

module.exports = poolWrapper;
