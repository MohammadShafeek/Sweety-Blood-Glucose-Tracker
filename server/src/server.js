const express = require("express");
require("dotenv").config();
const cors = require("cors");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.send("Sweety API is running!");
});

// Check database connection
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});