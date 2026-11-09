const bcrypt = require("bcrypt");
const pool = require("./config/db");

const getLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const seedDatabase = async () => {
  try {
    // Create demo user with hashed password
    const hashedPassword = await bcrypt.hash("Demo@123", 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash
       RETURNING id`,
      ["Demo User", "demo@sweety.com", hashedPassword]
    );

    const userId = userResult.rows[0].id;

    // Prepare sample reading dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayDate = getLocalDate(today);
    const yesterdayDate = getLocalDate(yesterday);

    // Sample glucose readings
    const readings = [
      [yesterdayDate, "Morning", 95],
      [yesterdayDate, "After breakfast", 135],
      [yesterdayDate, "After lunch", 128],
      [yesterdayDate, "After dinner", 142],
      [todayDate, "Morning", 98],
      [todayDate, "After breakfast", 130],
    ];

    // Insert readings without creating duplicates
    for (const reading of readings) {
      await pool.query(
        `INSERT INTO readings
         (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot)
         DO NOTHING`,
        [userId, ...reading]
      );
    }

    console.log("Database seeded successfully!");
    console.log("Demo Email: demo@sweety.com");
    console.log("Demo Password: Demo@123");
    console.log("Sample readings added successfully.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();