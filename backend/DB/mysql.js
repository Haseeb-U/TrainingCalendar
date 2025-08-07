const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.MYSQL_DB_NAME || 'TrainingCalendarDB';

async function initDatabase() {
  // Connect without specifying database to check/create it
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true,
  });

  // Create database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await connection.end();

  // Connect to the created database
  const db = await mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Create tables if they don't exist (run each separately)
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    employee_no INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    date DATE DEFAULT (CURRENT_DATE)
);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Trainings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration INT NOT NULL,
    number_of_participants INT NOT NULL,
    schedule_date DATETIME NOT NULL,
    created_at DATE DEFAULT (CURRENT_DATE),
    venue VARCHAR(100) NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    training_hours INT NOT NULL,
    notification_recipients JSON NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    training_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (training_id) REFERENCES Trainings(id) ON DELETE CASCADE
);`);

  return db;
}

module.exports = { initDatabase, DB_NAME };