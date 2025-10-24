const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testColumnFix() {
  try {
    console.log('Testing column name fixes...\n');

    // Test 1: Get all expenses (this was failing before)
    console.log('1. Testing GET /api/expenses');
    try {
      const expensesResponse = await axios.get(`${BASE_URL}/expenses`);
      console.log('✅ Expenses API working - Status:', expensesResponse.status);
      if (expensesResponse.data.data && expensesResponse.data.data.length > 0) {
        console.log('   Sample expense:', JSON.stringify(expensesResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Expenses API failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Get all accounts
    console.log('\n2. Testing GET /api/accounts');
    try {
      const accountsResponse = await axios.get(`${BASE_URL}/accounts`);
      console.log('✅ Accounts API working - Status:', accountsResponse.status);
      if (accountsResponse.data.data && accountsResponse.data.data.length > 0) {
        console.log('   Sample account:', JSON.stringify(accountsResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Accounts API failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Get all persons (baseline test)
    console.log('\n3. Testing GET /api/persons');
    try {
      const personsResponse = await axios.get(`${BASE_URL}/persons`);
      console.log('✅ Persons API working - Status:', personsResponse.status);
      if (personsResponse.data.data && personsResponse.data.data.length > 0) {
        console.log('   Sample person:', JSON.stringify(personsResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Persons API failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('Test setup error:', error.message);
  }
}

// Only run if server is likely running
testColumnFix().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.log('Server not running. Please start the server first with: npm run start');
  } else {
    console.error('Error:', err.message);
  }
});