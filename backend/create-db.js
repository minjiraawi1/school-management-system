/**
 * Create Database Script
 * Creates the PostgreSQL database if it doesn't exist
 * Usage: node create-db.js
 */

const { Pool } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to default postgres database first
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  const client = await pool.connect();

  try {
    console.log('📦 Checking if database exists...\n');

    const dbName = process.env.DB_NAME || 'school_db';
    
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists!\n`);
    } else {
      console.log(`📝 Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✓ Database "${dbName}" created successfully!\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

createDatabase();
