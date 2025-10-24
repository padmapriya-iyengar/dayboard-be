const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testExpenseOrdering() {
  try {
    console.log('Testing expense ordering by date...\n');

    // Test 1: Get expenses with default ordering (should be by date DESC)
    console.log('1. Testing default ordering (TxnDate DESC - most recent first)');
    try {
      const response = await axios.get(`${BASE_URL}/expenses?limit=10`);
      if (response.data.data && response.data.data.length > 0) {
        console.log('✅ Expenses retrieved successfully');
        console.log('First 3 expenses (should be ordered by date DESC):');
        response.data.data.slice(0, 3).forEach((expense, index) => {
          console.log(`   ${index + 1}. Date: ${expense.TxnDate}, Amount: ${expense.Amount}, Description: ${expense.Description}`);
        });
        
        // Verify ordering
        const dates = response.data.data.map(e => new Date(e.TxnDate));
        const isDescending = dates.every((date, i) => i === 0 || dates[i-1] >= date);
        console.log(`   Order verification: ${isDescending ? '✅ Correctly ordered by date DESC (newest first)' : '❌ Not properly ordered'}`);
      }
    } catch (error) {
      console.log('❌ Default ordering test failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Get expenses with explicit date ASC ordering
    console.log('\n2. Testing explicit TxnDate ASC ordering');
    try {
      const response = await axios.get(`${BASE_URL}/expenses?limit=5&sortBy=TxnDate&sortOrder=asc`);
      if (response.data.data && response.data.data.length > 0) {
        console.log('✅ Expenses with ASC ordering retrieved');
        response.data.data.forEach((expense, index) => {
          console.log(`   ${index + 1}. Date: ${expense.TxnDate}, Amount: ${expense.Amount}`);
        });
        
        // Verify ordering
        const dates = response.data.data.map(e => new Date(e.TxnDate));
        const isAscending = dates.every((date, i) => i === 0 || dates[i-1] <= date);
        console.log(`   Order verification: ${isAscending ? '✅ Correctly ordered by date ASC' : '❌ Not properly ordered'}`);
      }
    } catch (error) {
      console.log('❌ ASC ordering test failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Get expenses with Amount ordering (should still have date as primary)
    console.log('\n3. Testing Amount ordering (should have date DESC as primary)');
    try {
      const response = await axios.get(`${BASE_URL}/expenses?limit=5&sortBy=Amount&sortOrder=desc`);
      if (response.data.data && response.data.data.length > 0) {
        console.log('✅ Expenses with Amount DESC ordering retrieved');
        response.data.data.forEach((expense, index) => {
          console.log(`   ${index + 1}. Date: ${expense.TxnDate}, Amount: ${expense.Amount}`);
        });
      }
    } catch (error) {
      console.log('❌ Amount ordering test failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('Test setup error:', error.message);
  }
}

// Only run if server is likely running
testExpenseOrdering().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.log('🔄 Server not running. Please start the server first with: npm run start');
    console.log('Then run this test again with: node test-expense-ordering.js');
  } else {
    console.error('Error:', err.message);
  }
});