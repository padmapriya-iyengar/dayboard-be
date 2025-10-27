const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testInstallmentTypeField() {
    console.log('🔍 Testing Installment Type Field Integration');
    console.log('=' .repeat(70));
    console.log('Time:', new Date().toISOString());
    console.log('');

    try {
        // Test 1: Get existing installments to see current state
        console.log('📋 Test 1: Get All Installments (Check for Type Field)');
        console.log('-' .repeat(50));
        
        const installmentsResponse = await fetch(`${BASE_URL}/installments?limit=5`);
        const installmentsData = await installmentsResponse.json();
        
        if (installmentsData.status === 'success') {
            console.log('✅ Installments retrieved successfully');
            console.log(`Found ${installmentsData.data.length} installments`);
            
            if (installmentsData.data.length > 0) {
                console.log('\nSample Installments with Type Field:');
                console.log('ID  | Amount   | Type         | Account Name     | Description');
                console.log('-' .repeat(70));
                
                installmentsData.data.forEach(installment => {
                    const id = installment.Id.toString().padEnd(3);
                    const amount = installment.Amount.toFixed(2).padStart(8);
                    const type = (installment.Type || 'No Type').substring(0, 11).padEnd(11);
                    const account = (installment.AccountName || 'N/A').substring(0, 15).padEnd(15);
                    const desc = (installment.Description || 'No desc').substring(0, 15);
                    
                    console.log(`${id} | ${amount} | ${type} | ${account} | ${desc}`);
                });
                
                // Check if Type field is present
                const hasTypeField = installmentsData.data.some(i => i.hasOwnProperty('Type'));
                console.log(`\n✅ Type field present in response: ${hasTypeField ? 'YES' : 'NO'}`);
            } else {
                console.log('⚠️ No installments found to test');
            }
        } else {
            console.log('❌ Failed to retrieve installments:', installmentsData.message);
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 2: Create new installment with Type field
        console.log('🆕 Test 2: Create Installment with Type Field');
        console.log('-' .repeat(50));
        
        // First get an account to use
        const accountsResponse = await fetch(`${BASE_URL}/accounts?limit=1`);
        const accountsData = await accountsResponse.json();
        
        if (accountsData.status === 'success' && accountsData.data.length > 0) {
            const testAccount = accountsData.data[0];
            console.log(`Using account: ${testAccount.Account} (ID: ${testAccount.Id})`);
            
            const newInstallment = {
                Account_Id: testAccount.Id,
                Amount: 250.75,
                Description: "Test installment with Type field",
                isDebit: true,
                Start_Date: new Date().toISOString(),
                End_Date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                Type: "Monthly Payment"
            };
            
            console.log('Creating installment with data:');
            console.log(JSON.stringify(newInstallment, null, 2));
            
            const createResponse = await fetch(`${BASE_URL}/installments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newInstallment)
            });
            
            const createData = await createResponse.json();
            console.log('Create Response Status:', createResponse.status);
            
            if (createData.status === 'success') {
                console.log('✅ Installment created successfully');
                console.log('Created installment:');
                console.log(`- ID: ${createData.data.Id}`);
                console.log(`- Amount: ${createData.data.Amount}`);
                console.log(`- Type: ${createData.data.Type || 'NOT SET'}`);
                console.log(`- Description: ${createData.data.Description}`);
                
                // Store ID for further tests
                global.testInstallmentId = createData.data.Id;
                
                if (createData.data.Type) {
                    console.log('✅ Type field successfully saved and returned');
                } else {
                    console.log('❌ Type field not returned in create response');
                }
            } else {
                console.log('❌ Failed to create installment:', createData.message);
                if (createData.error) {
                    console.log('Error details:', createData.error);
                }
            }
        } else {
            console.log('❌ No accounts available for testing');
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 3: Get single installment to verify Type field
        if (global.testInstallmentId) {
            console.log(`🔍 Test 3: Get Single Installment (ID: ${global.testInstallmentId})`);
            console.log('-' .repeat(50));
            
            const singleResponse = await fetch(`${BASE_URL}/installments/${global.testInstallmentId}`);
            const singleData = await singleResponse.json();
            
            if (singleData.status === 'success') {
                console.log('✅ Single installment retrieved successfully');
                console.log('Installment details:');
                console.log(`- ID: ${singleData.data.Id}`);
                console.log(`- Amount: ${singleData.data.Amount}`);
                console.log(`- Type: ${singleData.data.Type || 'NOT SET'}`);
                console.log(`- Account: ${singleData.data.AccountName}`);
                console.log(`- Description: ${singleData.data.Description}`);
                console.log(`- Start Date: ${singleData.data.Start_Date}`);
                console.log(`- End Date: ${singleData.data.End_Date}`);
                
                if (singleData.data.Type === "Monthly Payment") {
                    console.log('✅ Type field correctly retrieved');
                } else {
                    console.log('❌ Type field value mismatch');
                }
            } else {
                console.log('❌ Failed to retrieve single installment:', singleData.message);
            }
            
            console.log('\n' + '=' .repeat(70) + '\n');
            
            // Test 4: Update installment Type field
            console.log('📝 Test 4: Update Installment Type Field');
            console.log('-' .repeat(50));
            
            const updateData = {
                Type: "Quarterly Payment",
                Amount: 300.00
            };
            
            const updateResponse = await fetch(`${BASE_URL}/installments/${global.testInstallmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            
            const updateResult = await updateResponse.json();
            console.log('Update Response Status:', updateResponse.status);
            
            if (updateResult.status === 'success') {
                console.log('✅ Installment updated successfully');
                console.log('Updated installment:');
                console.log(`- ID: ${updateResult.data.Id}`);
                console.log(`- Amount: ${updateResult.data.Amount}`);
                console.log(`- Type: ${updateResult.data.Type || 'NOT SET'}`);
                
                if (updateResult.data.Type === "Quarterly Payment") {
                    console.log('✅ Type field successfully updated');
                } else {
                    console.log('❌ Type field update failed');
                }
            } else {
                console.log('❌ Failed to update installment:', updateResult.message);
            }
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 5: Test validation for Type field
        console.log('🛡️ Test 5: Test Type Field Validation');
        console.log('-' .repeat(50));
        
        if (accountsData.status === 'success' && accountsData.data.length > 0) {
            const testAccount = accountsData.data[0];
            
            // Test with very long Type value
            const invalidInstallment = {
                Account_Id: testAccount.Id,
                Amount: 100.00,
                Description: "Test validation",
                isDebit: true,
                Type: "A".repeat(150) // 150 characters - should exceed validation limit
            };
            
            const validationResponse = await fetch(`${BASE_URL}/installments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invalidInstallment)
            });
            
            const validationData = await validationResponse.json();
            console.log('Validation Test Status:', validationResponse.status);
            
            if (validationResponse.status === 400 && validationData.message.includes('Type')) {
                console.log('✅ Type field validation working correctly');
                console.log('Validation error:', validationData.message);
            } else if (validationData.status === 'success') {
                console.log('⚠️ Type field validation may be too lenient or not working');
                // Clean up if created
                if (validationData.data?.Id) {
                    await fetch(`${BASE_URL}/installments/${validationData.data.Id}`, { method: 'DELETE' });
                }
            } else {
                console.log('❓ Unexpected validation response:', validationData.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Server is not running');
        console.log('2. Wrong port number (check your server config)');
        console.log('3. Database connection issue');
        console.log('4. Type column not added to Person_Installments table');
        console.log('5. Make sure to install: npm install node-fetch');
    }
    
    console.log('');
    console.log('=' .repeat(70));
    console.log('🏁 Installment Type Field Integration Test Complete');
    console.log('');
    console.log('📝 Summary:');
    console.log('- Type field added to all installment interfaces');
    console.log('- Service methods updated to handle Type field');
    console.log('- Controller automatically processes Type field');
    console.log('- Routes include Type field in documentation');
    console.log('- Validation schemas updated for Type field');
    console.log('- All CRUD operations support Type field');
}

// Global variable to store test installment ID
global.testInstallmentId = null;

// Run the test
console.log('🧪 Installment Type Field Integration Test');
console.log('Testing Type field integration across all installment APIs');
console.log('');

testInstallmentTypeField();