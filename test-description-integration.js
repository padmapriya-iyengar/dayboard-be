const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testDescriptionFieldUpdates() {
  try {
    console.log('🧪 Testing Description Field Integration\n');

    // Test 1: Verify Description field appears in responses
    console.log('1. Testing Description field in API responses...');
    try {
      const response = await axios.get(`${BASE_URL}/installments?limit=10`);
      console.log('✅ API Response received successfully');
      
      if (response.data.data && response.data.data.length > 0) {
        const firstInstallment = response.data.data[0];
        console.log('Sample installment with Description:');
        console.log({
          Id: firstInstallment.Id,
          Amount: firstInstallment.Amount,
          Description: firstInstallment.Description,
          AccountName: firstInstallment.AccountName,
          PersonName: firstInstallment.PersonName
        });
        
        // Verify Description field exists
        if (firstInstallment.hasOwnProperty('Description')) {
          console.log('✅ Description field present in response');
        } else {
          console.log('❌ Description field missing from response');
        }
      }
    } catch (error) {
      console.log('❌ Failed to get installments:', error.response?.data?.message || error.message);
    }

    // Test 2: Search functionality by Description
    console.log('\n2. Testing search by Description...');
    try {
      const searchTests = ['PL', 'EMI', 'Salary', 'CC'];
      
      for (const searchTerm of searchTests) {
        const response = await axios.get(`${BASE_URL}/installments?search=${searchTerm}&limit=5`);
        console.log(`✅ Search for "${searchTerm}": Found ${response.data.data.length} installments`);
        
        if (response.data.data.length > 0) {
          response.data.data.forEach(installment => {
            if (installment.Description && installment.Description.toLowerCase().includes(searchTerm.toLowerCase())) {
              console.log(`   - Match: "${installment.Description}"`);
            }
          });
        }
      }
    } catch (error) {
      console.log('❌ Search test failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Sorting by Description
    console.log('\n3. Testing sorting by Description...');
    try {
      const sortResponse = await axios.get(`${BASE_URL}/installments?sortBy=Description&sortOrder=asc&limit=10`);
      console.log('✅ Sort by Description (ascending) works');
      
      if (sortResponse.data.data.length > 0) {
        console.log('Installments sorted by Description:');
        sortResponse.data.data.forEach((installment, index) => {
          console.log(`   ${index + 1}. "${installment.Description}" (Amount: ${installment.Amount})`);
        });
      }
    } catch (error) {
      console.log('❌ Sort by Description failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Create installment with Description
    console.log('\n4. Testing create installment with Description...');
    try {
      // First get an account to use
      const accountsResponse = await axios.get(`${BASE_URL}/accounts?limit=1`);
      if (accountsResponse.data.data && accountsResponse.data.data.length > 0) {
        const testAccount = accountsResponse.data.data[0];
        
        const newInstallment = {
          Account_Id: testAccount.Id,
          Amount: 1500.00,
          Description: 'Test Description Field Integration',
          isDebit: true,
          Start_Date: new Date('2025-01-01'),
          End_Date: new Date('2025-12-31')
        };

        const createResponse = await axios.post(`${BASE_URL}/installments`, newInstallment);
        console.log('✅ Created installment with Description:', createResponse.data.data.Description);
        
        const newId = createResponse.data.data.Id;

        // Test 5: Update Description
        console.log('\n5. Testing update Description...');
        const updateData = {
          Description: 'Updated Description for Testing'
        };
        const updateResponse = await axios.put(`${BASE_URL}/installments/${newId}`, updateData);
        console.log('✅ Updated Description:', updateResponse.data.data.Description);

        // Clean up - delete test installment
        await axios.delete(`${BASE_URL}/installments/${newId}`);
        console.log('✅ Test installment cleaned up');
      }
    } catch (error) {
      console.log('❌ Create/Update test failed:', error.response?.data?.message || error.message);
    }

    // Test 6: Verify all installment types from your data
    console.log('\n6. Verifying installment types from your data...');
    try {
      const response = await axios.get(`${BASE_URL}/installments`);
      const installments = response.data.data;
      
      console.log('📊 Current Installments Summary:');
      installments.forEach(installment => {
        const type = installment.isDebit ? 'DEBIT' : 'CREDIT';
        console.log(`   ${type}: ${installment.Description} - ${installment.Amount} ${installment.Currency} (${installment.AccountName})`);
      });

      // Verify expected installments
      const plEmi = installments.find(i => i.Description && i.Description.includes('PL EMI'));
      const ccEmi = installments.find(i => i.Description && i.Description.includes('CC EMI'));
      const salary = installments.find(i => i.Description && i.Description.includes('Salary'));

      console.log('\n✅ Verification Results:');
      console.log(`   PL EMI found: ${plEmi ? 'Yes' : 'No'}`);
      console.log(`   CC EMI found: ${ccEmi ? 'Yes' : 'No'}`);
      console.log(`   Salary found: ${salary ? 'Yes' : 'No'}`);

    } catch (error) {
      console.log('❌ Verification failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Description field integration tests completed!');

  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
}

// Run the test
testDescriptionFieldUpdates().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.log('🔄 Server not running. Please start the server first.');
  } else {
    console.error('Error:', err.message);
  }
});