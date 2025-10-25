const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function debugDescriptionField() {
  try {
    console.log('🔍 Debugging Description field visibility...\n');

    // Test 1: Check raw database query results
    console.log('1. Testing API response structure...');
    try {
      const response = await axios.get(`${BASE_URL}/installments?limit=1`);
      
      if (response.data.data && response.data.data.length > 0) {
        const installment = response.data.data[0];
        console.log('📋 Raw API Response:');
        console.log(JSON.stringify(installment, null, 2));
        
        console.log('\n🔍 Field Analysis:');
        console.log('- Id:', installment.Id);
        console.log('- Account_Id:', installment.Account_Id);
        console.log('- Amount:', installment.Amount);
        console.log('- Description:', installment.Description);
        console.log('- isDebit:', installment.isDebit);
        console.log('- Start_Date:', installment.Start_Date);
        console.log('- End_Date:', installment.End_Date);
        
        if (installment.Description === undefined) {
          console.log('❌ Description field is undefined');
        } else if (installment.Description === null) {
          console.log('⚠️ Description field is null');
        } else if (installment.Description === '') {
          console.log('⚠️ Description field is empty string');
        } else {
          console.log('✅ Description field has value:', installment.Description);
        }
      } else {
        console.log('❌ No installments found in API response');
      }
    } catch (error) {
      console.log('❌ API Error:', error.response?.data?.message || error.message);
      
      if (error.response?.data) {
        console.log('Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 2: Try to create an installment with Description
    console.log('\n2. Testing create installment with Description...');
    try {
      // First get an account
      const accountsResponse = await axios.get(`${BASE_URL}/accounts?limit=1`);
      
      if (accountsResponse.data.data && accountsResponse.data.data.length > 0) {
        const testAccount = accountsResponse.data.data[0];
        
        const testInstallment = {
          Account_Id: testAccount.Id,
          Amount: 999.99,
          Description: 'TEST DESCRIPTION FIELD',
          isDebit: true,
          Start_Date: new Date().toISOString(),
          End_Date: new Date(Date.now() + 365*24*60*60*1000).toISOString()
        };
        
        console.log('📤 Sending create request with:');
        console.log(JSON.stringify(testInstallment, null, 2));
        
        const createResponse = await axios.post(`${BASE_URL}/installments`, testInstallment);
        
        console.log('\n📥 Create response:');
        console.log(JSON.stringify(createResponse.data.data, null, 2));
        
        const createdId = createResponse.data.data.Id;
        
        // Test 3: Retrieve the created installment
        console.log('\n3. Testing retrieve created installment...');
        const getResponse = await axios.get(`${BASE_URL}/installments/${createdId}`);
        
        console.log('📥 Retrieved installment:');
        console.log(JSON.stringify(getResponse.data.data, null, 2));
        
        // Clean up
        await axios.delete(`${BASE_URL}/installments/${createdId}`);
        console.log('✅ Test installment cleaned up');
        
      } else {
        console.log('❌ No accounts found for testing');
      }
    } catch (error) {
      console.log('❌ Create/Retrieve test failed:', error.response?.data?.message || error.message);
      
      if (error.response?.data) {
        console.log('Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Debug test error:', error.message);
  }
}

// Run the debug test
debugDescriptionField().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.log('🔄 Server not running. Please start the server first.');
  } else {
    console.error('Error:', err.message);
  }
});