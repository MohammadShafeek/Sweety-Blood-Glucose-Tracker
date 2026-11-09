const pool = require("../config/db");

// Get current date in YYYY-MM-DD format
const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Get summary of readings for a date range
const getSummary = async (userId, startDate, endDate) => {
    const result = await pool.query(
        `SELECT
            COUNT(*)::INTEGER AS count,
            MAX(glucose_value) AS highest,
            MIN(glucose_value) AS lowest,
            ROUND(AVG(glucose_value)::NUMERIC, 1) AS average
         FROM readings
         WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date < $3`,
        [userId, startDate, endDate]
    );

    const row = result.rows[0];

    return {
        count: row.count,
        highest: row.highest,
        lowest: row.lowest,
        average: row.average === null ? null : Number(row.average)
    };
};

// Daily report
const getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date in YYYY-MM-DD format."
            });
        }

        const startDate = new Date(`${date}T00:00:00.000Z`);

        if (
            Number.isNaN(startDate.getTime()) ||
            startDate.toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date."
            });
        }

        const nextDate = new Date(startDate);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);

        const endDate = nextDate.toISOString().slice(0, 10);

        const summary = await getSummary(req.user.id, date, endDate);

        const readingsResult = await pool.query(
            `SELECT
                id,
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                time_slot,
                glucose_value
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE time_slot
                    WHEN 'Morning' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [req.user.id, date]
        );

        res.json({
            success: true,
            date,
            summary,
            readings: readingsResult.rows
        });

    } catch (error) {
        console.error("Daily report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to generate daily report."
        });
    }
};

// Current month-to-date report
const getMonthlyReport = async (req, res) => {
    try {
        const today = getToday();
        const currentMonth = today.slice(0, 7);
        const startDate = `${currentMonth}-01`;

        const endDate = new Date(`${today}T00:00:00.000Z`);
        endDate.setUTCDate(endDate.getUTCDate() + 1);

        const nextDate = endDate.toISOString().slice(0, 10);

        const summary = await getSummary(
            req.user.id,
            startDate,
            nextDate
        );

        res.json({
            success: true,
            period: "Month to date",
            month: currentMonth,
            summary
        });

    } catch (error) {
        console.error("Monthly report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to generate monthly report."
        });
    }
};

// Previous month report
const getPreviousMonthReport = async (req, res) => {
    try {
        const today = new Date();

        const previousMonthDate = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );

        const currentMonthDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");

            return `${year}-${month}-01`;
        };

        const startDate = formatDate(previousMonthDate);
        const endDate = formatDate(currentMonthDate);

        const summary = await getSummary(
            req.user.id,
            startDate,
            endDate
        );

        res.json({
            success: true,
            period: "Previous month",
            month: startDate.slice(0, 7),
            summary
        });

    } catch (error) {
        console.error("Previous month report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to generate previous month report."
        });
    }
};

module.exports = {
    getDailyReport,
    getMonthlyReport,
    getPreviousMonthReport
};