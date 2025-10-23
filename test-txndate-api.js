// Test script for TxnDate functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';

async function testTxnDateAPI() {
  try {
    console.log('🧪 Testing Updated Expense API with TxnDate...\n');

    // Test 1: Create expense with TxnDate
    console.log('1. Testing POST /expenses with TxnDate');
    const newExpense = {
      Amount: 250.75,
      Description: 'Test Expense with Date',
      isDebit: true,
      TxnDate: '2025-01-15'
    };

    try {
      const response = await axios.post(`${BASE_URL}/expenses`, newExpense);
      console.log('✅ Status:', response.status);
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
      
      const expenseId = response.data.data.Id;
      console.log('💾 Created expense ID:', expenseId);

      console.log('\n---\n');

      // Test 2: Create another expense for different date
      console.log('2. Testing POST /expenses with different date');
      const secondExpense = {
        Amount: 100.50,
        Description: 'Another Test Expense',
        isDebit: false,
        TxnDate: '2025-02-10'
      };

      const response2 = await axios.post(`${BASE_URL}/expenses`, secondExpense);
      const expenseId2 = response2.data.data.Id;
      console.log('✅ Created second expense ID:', expenseId2);

      console.log('\n---\n');

      // Test 3: Get all expenses (should include TxnDate)
      console.log('3. Testing GET /expenses (should show TxnDate)');
      try {
        const getResponse = await axios.get(`${BASE_URL}/expenses`);
        console.log('✅ Status:', getResponse.status);
        console.log('📄 First expense:', JSON.stringify(getResponse.data.data[0], null, 2));
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }

      console.log('\n---\n');

      // Test 4: Filter by date range
      console.log('4. Testing GET /expenses with date filtering');
      try {
        const filterResponse = await axios.get(`${BASE_URL}/expenses?dateFrom=2025-01-01&dateTo=2025-01-31`);
        console.log('✅ Status:', filterResponse.status);
        console.log('📄 Filtered expenses (Jan 2025):', JSON.stringify(filterResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }

      console.log('\n---\n');

      // Test 5: Update expense with new TxnDate
      console.log('5. Testing PUT /expenses/:id with TxnDate update');
      const updateData = {
        Amount: 300.00,
        TxnDate: '2025-03-15'
      };

      try {
        const updateResponse = await axios.put(`${BASE_URL}/expenses/${expenseId}`, updateData);
        console.log('✅ Status:', updateResponse.status);
        console.log('📄 Updated expense:', JSON.stringify(updateResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }

      console.log('\n---\n');

      // Test 6: Get statistics with date filtering
      console.log('6. Testing GET /expenses/stats with date filtering');
      try {
        const statsResponse = await axios.get(`${BASE_URL}/expenses/stats?dateFrom=2025-02-01&dateTo=2025-02-28`);
        console.log('✅ Status:', statsResponse.status);
        console.log('📄 Feb 2025 Statistics:', JSON.stringify(statsResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }

      console.log('\n---\n');

      // Test 7: Get enhanced summary (should show monthly/yearly breakdown)
      console.log('7. Testing GET /expenses/summary (enhanced with date ranges)');
      try {
        const summaryResponse = await axios.get(`${BASE_URL}/expenses/summary`);
        console.log('✅ Status:', summaryResponse.status);
        console.log('📄 Enhanced Summary:', JSON.stringify(summaryResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }

      console.log('\n---\n');

      // Test 8: Sorting by TxnDate
      console.log('8. Testing GET /expenses with TxnDate sorting');
      try {
        const sortResponse = await axios.get(`${BASE_URL}/expenses?sortBy=TxnDate&sortOrder=desc`);
        console.log('✅ Status:', sortResponse.status);
        console.log('📄 Expenses sorted by TxnDate (newest first):');
        sortResponse.data.data.forEach((expense, index) => {
          console.log(`   ${index + 1}. ${expense.Description} - ${expense.TxnDate} - $${expense.Amount}`);
        });
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }

      console.log('\n---\n');

      // Cleanup: Delete test expenses
      console.log('9. Cleaning up test expenses');
      try {
        await axios.delete(`${BASE_URL}/expenses/${expenseId}`);
        await axios.delete(`${BASE_URL}/expenses/${expenseId2}`);
        console.log('✅ Test expenses deleted');
      } catch (error) {
        console.log('❌ Cleanup error:', error.response?.status, error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.log('❌ Create expense failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n🎉 TxnDate functionality test completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Wait and run tests
setTimeout(testTxnDateAPI, 1000);