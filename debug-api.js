// Simple test to debug the expense API issue
const http = require('http');

function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing DayBoard API...\n');

  try {
    // Test 1: Main API endpoint
    console.log('1. Testing GET /api/v1');
    const mainApi = await testAPI('/api/v1');
    console.log(`   Status: ${mainApi.status}`);
    console.log(`   Response: ${JSON.stringify(mainApi.data, null, 2)}\n`);

    // Test 2: Health endpoint
    console.log('2. Testing GET /health');
    const health = await testAPI('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test 3: Expenses endpoint
    console.log('3. Testing GET /api/v1/expenses');
    const expenses = await testAPI('/api/v1/expenses');
    console.log(`   Status: ${expenses.status}`);
    console.log(`   Response: ${JSON.stringify(expenses.data, null, 2)}\n`);

    // Test 4: Expense stats endpoint  
    console.log('4. Testing GET /api/v1/expenses/stats');
    const stats = await testAPI('/api/v1/expenses/stats');
    console.log(`   Status: ${stats.status}`);
    console.log(`   Response: ${JSON.stringify(stats.data, null, 2)}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Wait a moment and run tests
setTimeout(runTests, 2000);