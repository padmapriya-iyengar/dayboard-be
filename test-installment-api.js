const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testInstallmentsAPI() {
  try {
    console.log('🚀 Testing Person Installments API\n');

    // Step 1: Get existing accounts to use for testing
    console.log('1. Getting existing accounts...');
    const accountsResponse = await axios.get(`${BASE_URL}/accounts?limit=5`);
    
    if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
      console.log('❌ No accounts found. Please create accounts first.');
      return;
    }

    const testAccount = accountsResponse.data.data[0];
    console.log(`✅ Using account: ${testAccount.AccountName} (ID: ${testAccount.Id})`);

    // Step 2: Create a test installment
    console.log('\n2. Creating a new installment...');
    const newInstallment = {
      Account_Id: testAccount.Id,
      Amount: 500.00,
      Description: 'Test monthly payment installment',
      isDebit: true,
      Start_Date: new Date('2024-01-01'),
      End_Date: new Date('2024-12-31')
    };

    const createResponse = await axios.post(`${BASE_URL}/installments`, newInstallment);
    console.log('✅ Installment created:', createResponse.data.data);
    const installmentId = createResponse.data.data.Id;

    // Step 3: Get all installments
    console.log('\n3. Getting all installments...');
    const allInstallmentsResponse = await axios.get(`${BASE_URL}/installments?limit=10`);
    console.log(`✅ Found ${allInstallmentsResponse.data.data.length} installments`);
    console.log('First installment:', allInstallmentsResponse.data.data[0]);

    // Step 4: Get installment by ID
    console.log(`\n4. Getting installment by ID (${installmentId})...`);
    const getByIdResponse = await axios.get(`${BASE_URL}/installments/${installmentId}`);
    console.log('✅ Installment retrieved:', getByIdResponse.data.data);

    // Step 5: Get installments by account
    console.log(`\n5. Getting installments for account ${testAccount.Id}...`);
    const byAccountResponse = await axios.get(`${BASE_URL}/installments/account/${testAccount.Id}`);
    console.log(`✅ Found ${byAccountResponse.data.data.length} installments for this account`);

    // Step 6: Update the installment
    console.log(`\n6. Updating installment ${installmentId}...`);
    const updateData = {
      Amount: 750.00,
      Description: 'Updated monthly payment with new amount',
      isDebit: false
    };
    const updateResponse = await axios.put(`${BASE_URL}/installments/${installmentId}`, updateData);
    console.log('✅ Installment updated:', updateResponse.data.data);

    // Step 7: Test filtering
    console.log('\n7. Testing filters...');
    
    // Filter by debit
    const debitResponse = await axios.get(`${BASE_URL}/installments?isDebit=true&limit=5`);
    console.log(`✅ Found ${debitResponse.data.data.length} debit installments`);

    // Filter by amount range
    const amountResponse = await axios.get(`${BASE_URL}/installments?amountMin=100&amountMax=1000&limit=5`);
    console.log(`✅ Found ${amountResponse.data.data.length} installments in amount range 100-1000`);

    // Filter by description search
    const searchResponse = await axios.get(`${BASE_URL}/installments?search=payment&limit=5`);
    console.log(`✅ Found ${searchResponse.data.data.length} installments matching 'payment'`);

    // Step 8: Get statistics
    console.log('\n8. Getting installment statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/installments/stats`);
    console.log('✅ Statistics:', statsResponse.data.data);

    // Step 9: Test sorting
    console.log('\n9. Testing sorting...');
    const sortedResponse = await axios.get(`${BASE_URL}/installments?sortBy=Amount&sortOrder=desc&limit=5`);
    console.log('✅ Sorted by amount (desc):', sortedResponse.data.data.map(i => ({ 
      Id: i.Id, 
      Amount: i.Amount, 
      Start_Date: i.Start_Date 
    })));

    // Step 10: Delete the test installment
    console.log(`\n10. Deleting test installment ${installmentId}...`);
    const deleteResponse = await axios.delete(`${BASE_URL}/installments/${installmentId}`);
    console.log('✅ Installment deleted:', deleteResponse.data.message);

    // Verify deletion
    try {
      await axios.get(`${BASE_URL}/installments/${installmentId}`);
      console.log('❌ Installment still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Installment successfully deleted (404 confirmed)');
      } else {
        console.log('❌ Unexpected error verifying deletion:', error.message);
      }
    }

    console.log('\n🎉 All installment API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, error.response.data);
    }
  }
}

// Only run if server is likely running
testInstallmentsAPI().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.log('🔄 Server not running. Please start the server first with: npm run start');
    console.log('Then run this test with: node test-installment-api.js');
  } else {
    console.error('Error:', err.message);
  }
});