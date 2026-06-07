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
        connection.release()
    }
})

module.exports = db