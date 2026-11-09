const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addReading,
    getReadings,
    updateReading,
    deleteReading
} = require("../controllers/readingController");

router.use(protect);

router.post("/", addReading);
router.get("/", getReadings);
router.put("/:id", updateReading);
router.delete("/:id", deleteReading);

module.exports = router;
