/**
 * Database Initialization Script
 * Runs all SQL files to set up the database schema
 * Usage: node init-db.js
 */

const pool = require('./config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database schema...\n');

    const sqlDir = path.join(__dirname, 'sql');
    const sqlFiles = [
      'users_table.sql',
      'classes_subjects_tables.sql',
      'teachers_students_assignments_tables.sql',
      'results_table.sql'
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(sqlDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📝 Running ${file}...`);
      try {
        await client.query(sql);
        console.log(`✓ ${file} executed successfully\n`);
      } catch (err) {
        if (err.code === '42P07') {
          console.log(`⚠️  ${file} - Tables already exist, skipping\n`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Database schema initialization complete!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

initializeDatabase();
