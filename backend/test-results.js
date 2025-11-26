// Quick test script to verify results endpoint

const http = require('http');

// First, login to get token
const loginData = JSON.stringify({ username: 'student1', password: 'student123' });

const loginOptions = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
};

console.log('🔐 Logging in as student1...');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const loginResponse = JSON.parse(data);
    const token = loginResponse.token;
    
    console.log('✅ Login successful!');
    console.log('📋 Student:', loginResponse.user.first_name, loginResponse.user.last_name);
    console.log('🔑 Token:', token.substring(0, 50) + '...\n');
    
    // Now test the results endpoint
    const resultsOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/results/student/me/2024-2025',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    
    console.log('📊 Fetching results for academic year 2024-2025...\n');
    
    const resultsReq = http.request(resultsOptions, (res) => {
      let resultsData = '';
      
      res.on('data', (chunk) => {
        resultsData += chunk;
      });
      
      res.on('end', () => {
        const resultsResponse = JSON.parse(resultsData);
        
        console.log('✅ Results fetched successfully!\n');
        console.log('📈 Academic Year:', resultsResponse.academic_year);
        console.log('📊 Subjects found:', resultsResponse.subjects.length);
        console.log('🎯 Annual Average:', resultsResponse.annual_average);
        console.log('');
        
        if (resultsResponse.subjects.length > 0) {
          console.log('📚 Subjects:');
          resultsResponse.subjects.forEach((subject, index) => {
            console.log(`   ${index + 1}. ${subject.subject_name} (${subject.subject_code})`);
            console.log(`      Term 1 Total: ${subject.term_1_total}`);
            console.log(`      Term 2 Total: ${subject.term_2_total}`);
            console.log(`      Annual Total: ${subject.annual_total}\n`);
          });
        } else {
          console.log('⚠️  No subjects found! Check database seeding.');
        }
        
        console.log('✅ Test completed successfully!');
      });
    });
    
    resultsReq.on('error', (error) => {
      console.error('❌ Error fetching results:', error);
    });
    
    resultsReq.end();
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Error during login:', error);
});

loginReq.write(loginData);
loginReq.end();
