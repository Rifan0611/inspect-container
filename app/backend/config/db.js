const mysql = require('mysql2')

require('dotenv').config()

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
})

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection failed:', err)
    } else {
        console.log('MySQL Connected')
        
        // Auto-migration: check if 'group' column exists in container_inspections table
        connection.query("SHOW COLUMNS FROM container_inspections LIKE 'group'", (colErr, results) => {
            if (colErr) {
                console.error("Error checking columns:", colErr);
            } else if (results && results.length === 0) {
                console.log("Column 'group' is missing in container_inspections. Altering table...");
                connection.query("ALTER TABLE container_inspections ADD COLUMN `group` VARCHAR(100) DEFAULT 'Lapangan'", (alterErr) => {
                    if (alterErr) {
                        console.error("Failed to add column 'group':", alterErr);
                    } else {
                        console.log("Column 'group' added successfully to container_inspections.");
                    }
                });
            } else {
                console.log("Column 'group' already exists in container_inspections.");
            }
        });

        connection.release()
    }
})

module.exports = db