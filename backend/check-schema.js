const pool = require('./config/db');

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'middle_name';
    `);
    
    if (result.rows.length > 0) {
      console.log('Column middle_name exists in users table.');
    } else {
      console.log('Column middle_name MISSING in users table.');
    }
    
    // Also check if we can connect at all
    const timeResult = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', timeResult.rows[0]);

  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    // Close the pool to allow the script to exit
    // Note: pool.end() might not be available depending on how db.js exports the pool
    // If it exports a pool instance directly:
    if (pool.end) pool.end();
    process.exit();
  }
}

checkSchema();
