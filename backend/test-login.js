const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🔍 Testing student1 login...\n');
    
    // Check if user exists
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', ['student1']);
    
    if (userRes.rows.length === 0) {
      console.log('✗ User "student1" not found in database');
      process.exit(1);
    }
    
    const user = userRes.rows[0];
    console.log('✓ User "student1" found');
    console.log('  ID:', user.id);
    console.log('  Role:', user.role);
    console.log('  Email:', user.email);
    console.log('  Password Hash:', user.password.substring(0, 30) + '...\n');
    
    // Test password
    const isMatch = await bcrypt.compare('student123', user.password);
    console.log('✓ Password Test: student123 ->', isMatch ? 'MATCH ✅' : 'NO MATCH ❌');
    
    if (isMatch) {
      console.log('\n✅ Login should work!');
    } else {
      console.log('\n❌ Password mismatch. Try resetting with seed.js');
    }
    
    process.exit(isMatch ? 0 : 1);
  } catch (err) {
    console.error('❌ Database Error:', err.message);
    process.exit(1);
  }
}

testLogin();
