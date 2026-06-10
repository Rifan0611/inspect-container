const mysql = require('mysql2/promise');
require('dotenv').config();

const check = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    console.log("Connected to DB successfully!");

    const [columns] = await connection.query("DESCRIBE container_inspections");
    console.log("Columns in container_inspections:", columns.map(c => c.Field));

    const hasGroup = columns.some(c => c.Field === 'group');
    if (!hasGroup) {
      console.log("Column 'group' is missing! Adding it...");
      await connection.query("ALTER TABLE container_inspections ADD COLUMN `group` VARCHAR(100) DEFAULT 'Lapangan'");
      console.log("Column 'group' added successfully!");
    } else {
      console.log("Column 'group' already exists.");
    }

    await connection.end();
  } catch (err) {
    console.error("Error checking/updating DB:", err);
  }
};

check();
