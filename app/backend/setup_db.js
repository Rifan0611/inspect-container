const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'inspect_container'
        });

        console.log('Connected to DB, running setup...');

        // Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'petugas') DEFAULT 'petugas',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Inspections table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inspections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                container_number VARCHAR(50) NOT NULL,
                ship_name VARCHAR(255) NOT NULL,
                condition_status VARCHAR(50) NOT NULL,
                damage_type VARCHAR(100),
                side VARCHAR(50),
                photo1 VARCHAR(255),
                photo2 VARCHAR(255),
                petugas_id INT,
                inspection_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (petugas_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Container inspections table for frontend sync
        await connection.query(`
            CREATE TABLE IF NOT EXISTS container_inspections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                container VARCHAR(50) NOT NULL,
                shipName VARCHAR(255) NOT NULL,
                status VARCHAR(50),
                iso VARCHAR(50),
                category VARCHAR(100),
                \`condition\` VARCHAR(50) NOT NULL,
                side VARCHAR(50),
                note TEXT,
                photo1 LONGTEXT,
                photo2 LONGTEXT,
                petugas VARCHAR(255) NOT NULL,
                \`date\` DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Manifests table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS manifests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                container VARCHAR(50) NOT NULL,
                shipName VARCHAR(255),
                status VARCHAR(50),
                iso VARCHAR(50),
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Accounts table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                jabatan VARCHAR(100) NOT NULL,
                nama VARCHAR(255) NOT NULL,
                \`group\` VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed default accounts if empty
        const [rows] = await connection.query("SELECT COUNT(*) as count FROM accounts");
        if (rows[0].count === 0) {
            console.log("Seeding default accounts...");
            const defaultAccounts = [
                ["manager", "123", "MANAGER", "Rian Agung", "Management"],
                ["supervisor", "123", "SUPERVISOR", "Budi Santoso", "Shift A"],
                ["assistant", "123", "ASSISTANT SUPERVISOR", "Andi Wijaya", "Shift B"],
                ["petugas", "123", "PETUGAS", "Petugas Lapangan", "Lapangan"],
                ["adminRAL", "Rifan0611", "ADMIN", "Admin NPH", "Office"]
            ];
            for (const acc of defaultAccounts) {
                await connection.query(
                    "INSERT INTO accounts (username, password, jabatan, nama, \`group\`) VALUES (?, ?, ?, ?, ?)",
                    acc
                );
            }
            console.log("Default accounts seeded.");
        }

        console.log('Database tables verified/created successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error setting up DB:', error);
        process.exit(1);
    }
};

setupDB();
