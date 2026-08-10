const express = require("express");
const cors = require("cors");
const pool = require("./db");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// HOME / TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "FeatureIQ backend is running!"
    });
});


// ==========================================
// TEST MYSQL CONNECTION
// ==========================================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT 1 AS connected"
        );

        res.json({
            message: "MySQL connected successfully!",
            result: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "MySQL connection failed",
            error: error.message
        });
    }
});


// ==========================================
// GET USERS
// ==========================================

app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM users"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch users"
        });
    }
});


// ==========================================
// GET ONE USER
// ==========================================

app.get("/api/users/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE user_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch user"
        });
    }
});


// ==========================================
// GET ACTIVITY
// ==========================================

app.get("/api/activity", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM activity"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch activity"
        });
    }
});


// ==========================================
// GET FEATURE USAGE
// ==========================================

app.get("/api/usage", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM feature_usage"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch feature usage"
        });
    }
});


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`FeatureIQ backend running on port ${PORT}`);
});