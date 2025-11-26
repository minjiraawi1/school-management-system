const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function updateDb() {
  try {
    const sqlPath = path.join(__dirname, 'sql', 'update_results_calculation.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration to update results calculation...');
    await pool.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

updateDb();
