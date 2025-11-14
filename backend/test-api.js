const http = require('http');

function testLoginAPI() {
  console.log('🔍 Testing POST /api/auth/login endpoint...\n');
  
  const postData = JSON.stringify({
    username: 'student1',
    password: 'student123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('Payload:', JSON.parse(postData), '\n');
  
  const req = http.request(options, (res) => {
    let data = '';
    
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers, '\n');
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200 && response.token) {
          console.log('\n✅ Login API is working!');
          console.log('Token:', response.token.substring(0, 30) + '...');
        } else {
          console.log('\n❌ Login failed with error:', response.error || response.message);
        }
      } catch (e) {
        console.log('Raw Response:', data);
      }
      process.exit(0);
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Request Error:', e.message);
    console.log('\n⚠️  Backend might not be running on port 5001');
    process.exit(1);
  });
  
  req.write(postData);
  req.end();
}

testLoginAPI();
