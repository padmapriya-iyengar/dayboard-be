const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testInstallmentsOrderBy() {
  try {
    console.log('🔍 Testing Installments API ORDER BY fix...\n');

    // Test 1: Default ordering (should work now)
    console.log('1. Testing default ordering (no sortBy specified)...');
    try {
      const response = await axios.get(`${BASE_URL}/installments?limit=5`);
      console.log('✅ Default ordering works!');
      console.log(`   Retrieved ${response.data.data.length} installments`);
      if (response.data.data.length > 0) {
        console.log('   First installment:', {
          Id: response.data.data[0].Id,
          Amount: response.data.data[0].Amount,
          Start_Date: response.data.data[0].Start_Date
        });
      }
    } catch (error) {
      console.log('❌ Default ordering failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Explicit Start_Date sorting
    console.log('\n2. Testing explicit Start_Date sorting...');
    try {
      const response = await axios.get(`${BASE_URL}/installments?sortBy=Start_Date&sortOrder=desc&limit=5`);
      console.log('✅ Start_Date DESC sorting works!');
      console.log(`   Retrieved ${response.data.data.length} installments`);
    } catch (error) {
      console.log('❌ Start_Date sorting failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Amount sorting (different column)
    console.log('\n3. Testing Amount sorting...');
    try {
      const response = await axios.get(`${BASE_URL}/installments?sortBy=Amount&sortOrder=desc&limit=5`);
      console.log('✅ Amount sorting works!');
      console.log(`   Retrieved ${response.data.data.length} installments`);
      if (response.data.data.length > 0) {
        console.log('   Amounts:', response.data.data.map(i => i.Amount));
      }
    } catch (error) {
      console.log('❌ Amount sorting failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Pagination
    console.log('\n4. Testing pagination...');
    try {
      const response = await axios.get(`${BASE_URL}/installments?page=1&limit=2`);
      console.log('✅ Pagination works!');
      console.log(`   Page: ${response.data.pagination.page}`);
      console.log(`   Total: ${response.data.pagination.total}`);
      console.log(`   Has Next: ${response.data.pagination.hasNext}`);
    } catch (error) {
      console.log('❌ Pagination failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All ORDER BY tests completed!');

  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
}

// Run the test
testInstallmentsOrderBy().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.log('🔄 Server not running. Please start the server first.');
  } else {
    console.error('Error:', err.message);
  }
});