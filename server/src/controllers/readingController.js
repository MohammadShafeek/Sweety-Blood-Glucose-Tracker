const pool = require("../config/db");

const timeSlots = ["Morning", "After breakfast", "After lunch", "After dinner"];

const validateReading = (date, slot, value) => {
  if (value === undefined || value === null || value === "") {
    return "Please enter a glucose value.";
  }

  if (!date) {
    return "Please select a date.";
  }

  if (!slot) {
    return "Please select a time slot.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Please enter a valid date.";
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return "Please enter a valid date.";
  }

  const today = new Date().toLocaleDateString("en-CA");

  if (date > today) {
    return "Date cannot be in the future.";
  }

  if (!timeSlots.includes(slot)) {
    return "Please select a valid time slot.";
  }

  if (!Number.isInteger(value) || value < 40 || value > 600) {
    return "Value must be between 40 and 600 mg/dl.";
  }

  return null;
};

// Add a new reading
const addReading = async (req, res) => {
  try {
    const { date, timeSlot, value } = req.body;

    const error = validateReading(date, timeSlot, value);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const userId = req.user.id;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM readings
             WHERE user_id = $1 AND reading_date = $2`,
      [userId, date],
    );

    if (Number(countResult.rows[0].count) >= 4) {
      return res.status(400).json({
        success: false,
        message: "You can add only 4 readings per day.",
      });
    }

    const existingReading = await pool.query(
      `SELECT id FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3`,
      [userId, date, timeSlot],
    );

    if (existingReading.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `You already have a ${timeSlot} reading for this date.`,
      });
    }

    const result = await pool.query(
      `INSERT INTO readings
             (user_id, reading_date, time_slot, glucose_value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [userId, date, timeSlot, value],
    );

    res.status(201).json({
      success: true,
      message: "Reading added successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this time slot.",
      });
    }

    console.error("Add reading error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to add reading.",
    });
  }
};

// Get logged-in user's readings
const getReadings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
                id,
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                time_slot,
                glucose_value,
                created_at,
                updated_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC,
             CASE time_slot
                WHEN 'Morning' THEN 1
                WHEN 'After breakfast' THEN 2
                WHEN 'After lunch' THEN 3
                WHEN 'After dinner' THEN 4
             END`,
      [req.user.id],
    );

    res.json({
      success: true,
      count: result.rows.length,
      readings: result.rows,
    });
  } catch (error) {
    console.error("Get readings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch readings.",
    });
  }
};

// Update a reading
const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot, value } = req.body;

    const error = validateReading(date, timeSlot, value);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const userId = req.user.id;

    const currentReading = await pool.query(
      `SELECT id FROM readings
             WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (currentReading.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reading not found.",
      });
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM readings
             WHERE user_id = $1 AND reading_date = $2
             AND id != $3`,
      [userId, date, id],
    );

    if (Number(countResult.rows[0].count) >= 4) {
      return res.status(400).json({
        success: false,
        message: "You can add only 4 readings per day.",
      });
    }

    const existingReading = await pool.query(
      `SELECT id FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3
             AND id != $4`,
      [userId, date, timeSlot, id],
    );

    if (existingReading.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `You already have an ${timeSlot} reading for this date.`,
      });
    }

    const result = await pool.query(
      `UPDATE readings
             SET reading_date = $1,
                 time_slot = $2,
                 glucose_value = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
      [date, timeSlot, value, id, userId],
    );

    res.json({
      success: true,
      message: "Reading updated successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this time slot.",
      });
    }

    console.error("Update reading error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update reading.",
    });
  }
};

// Delete a reading
const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reading not found.",
      });
    }

    res.json({
      success: true,
      message: "Reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reading error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete reading.",
    });
  }
};

module.exports = {
  addReading,
  getReadings,
  updateReading,
  deleteReading,
};
