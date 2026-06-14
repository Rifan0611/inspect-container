const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await connection.execute('ALTER TABLE inspections MODIFY COLUMN side VARCHAR(1000);');
    console.log('inspections.side altered');
  } catch(e) { console.log(e.message); }

  try {
    await connection.execute('ALTER TABLE inspections MODIFY COLUMN damage_type VARCHAR(1000);');
    console.log('inspections.damage_type altered');
  } catch(e) { console.log(e.message); }
  
  try {
    await connection.execute('ALTER TABLE container_inspections MODIFY COLUMN `condition` VARCHAR(1000);');
    console.log('container_inspections.condition altered');
  } catch(e) { console.log(e.message); }

  try {
    await connection.execute('ALTER TABLE container_inspections MODIFY COLUMN side VARCHAR(1000);');
    console.log('container_inspections.side altered');
  } catch(e) { console.log(e.message); }

  process.exit(0);
}
run();
