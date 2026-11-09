const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getDailyReport,
    getMonthlyReport,
    getPreviousMonthReport
} = require("../controllers/reportController");

router.use(protect);

router.get("/daily", getDailyReport);
router.get("/monthly", getMonthlyReport);
router.get("/previous-month", getPreviousMonthReport);

module.exports = router;