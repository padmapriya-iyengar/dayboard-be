const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1'; // Adjust port if needed

async function testTypeColumn() {
    console.log('🔍 Testing Type Column Integration');
    console.log('=' .repeat(60));
    console.log('Time:', new Date().toISOString());
    console.log('');

    try {
        // Test 1: Create account with Type
        console.log('📝 Test 1: Create Account with Type');
        console.log('-' .repeat(40));
        
        const createAccountData = {
            Person_Id: 1, // Adjust based on your data
            Account: "Test Savings Account",
            Currency: "AED",
            Type: "Savings"
        };
        
        const createResponse = await fetch(`${BASE_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createAccountData)
        });
        
        const createResult = await createResponse.json();
        console.log('Create Status:', createResponse.status);
        console.log('Create Response:', JSON.stringify(createResult, null, 2));
        
        let createdAccountId = null;
        if (createResult.status === 'success' && createResult.data?.Id) {
            createdAccountId = createResult.data.Id;
            console.log('✅ Account created successfully with Type:', createResult.data.Type);
        } else {
            console.log('❌ Failed to create account');
        }
        
        console.log('');
        
        // Test 2: Get all accounts (should show Type column)
        console.log('📋 Test 2: Get All Accounts');
        console.log('-' .repeat(40));
        
        const accountsResponse = await fetch(`${BASE_URL}/accounts?limit=5`);
        const accountsData = await accountsResponse.json();
        
        console.log('Accounts Status:', accountsResponse.status);
        
        if (accountsData.status === 'success') {
            console.log('✅ Accounts retrieved successfully');
            console.log(`Found ${accountsData.data.length} accounts`);
            
            console.log('');
            console.log('Account Details:');
            console.log('ID  | Account Name         | Currency | Type      | Person');
            console.log('-' .repeat(70));
            
            accountsData.data.forEach(account => {
                const id = account.Id.toString().padEnd(3);
                const name = (account.AccountName || 'N/A').substring(0, 20).padEnd(20);
                const currency = (account.Currency || 'N/A').padEnd(8);
                const type = (account.Type || 'N/A').padEnd(9);
                const person = (account.PersonName || 'Unknown').substring(0, 15);
                
                console.log(`${id} | ${name} | ${currency} | ${type} | ${person}`);
            });
        } else {
            console.log('❌ Failed to retrieve accounts:', accountsData.message);
        }
        
        console.log('');
        
        // Test 3: Get expenses (should show AccountType)
        console.log('💰 Test 3: Get Expenses with Account Types');
        console.log('-' .repeat(40));
        
        const expensesResponse = await fetch(`${BASE_URL}/expenses?limit=5`);
        const expensesData = await expensesResponse.json();
        
        console.log('Expenses Status:', expensesResponse.status);
        
        if (expensesData.status === 'success') {
            console.log('✅ Expenses retrieved successfully');
            console.log(`Found ${expensesData.data.length} expenses`);
            
            console.log('');
            console.log('Expense Details:');
            console.log('ID  | Amount   | Currency | Acc.Type  | Account Name');
            console.log('-' .repeat(65));
            
            expensesData.data.forEach(expense => {
                const id = expense.Id.toString().padEnd(3);
                const amount = expense.Amount.toFixed(2).padStart(8);
                const currency = (expense.Currency || 'N/A').padEnd(8);
                const type = (expense.AccountType || 'N/A').padEnd(9);
                const account = (expense.AccountName || 'N/A').substring(0, 15);
                
                console.log(`${id} | ${amount} | ${currency} | ${type} | ${account}`);
            });
        } else {
            console.log('❌ Failed to retrieve expenses:', expensesData.message);
        }
        
        console.log('');
        
        // Test 4: Portfolio with Account Types
        console.log('📊 Test 4: Portfolio with Account Types');
        console.log('-' .repeat(40));
        
        const portfolioResponse = await fetch(`${BASE_URL}/portfolio`);
        const portfolioData = await portfolioResponse.json();
        
        console.log('Portfolio Status:', portfolioResponse.status);
        
        if (portfolioData.status === 'success') {
            console.log('✅ Portfolio retrieved successfully');
            
            portfolioData.data.portfolios.forEach((portfolio, index) => {
                console.log(`\n${index + 1}. ${portfolio.personName} (ID: ${portfolio.personId})`);
                
                portfolio.accounts.forEach((account, accIndex) => {
                    console.log(`   ${accIndex + 1}. ${account.accountName}`);
                    console.log(`      Currency: ${account.currency}`);
                    console.log(`      Type: ${account.accountType || 'N/A'}`);
                    console.log(`      Amount: ${account.amounts.totalAmount}`);
                });
            });
        } else {
            console.log('❌ Failed to retrieve portfolio:', portfolioData.message);
        }
        
        console.log('');
        
        // Test 5: Update account with Type
        if (createdAccountId) {
            console.log('✏️  Test 5: Update Account Type');
            console.log('-' .repeat(40));
            
            const updateData = {
                Type: "Current Account"
            };
            
            const updateResponse = await fetch(`${BASE_URL}/accounts/${createdAccountId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const updateResult = await updateResponse.json();
            console.log('Update Status:', updateResponse.status);
            
            if (updateResult.status === 'success') {
                console.log('✅ Account type updated successfully');
                console.log('New Type:', updateResult.data.Type);
            } else {
                console.log('❌ Failed to update account type:', updateResult.message);
            }
            
            // Clean up - delete the test account
            try {
                await fetch(`${BASE_URL}/accounts/${createdAccountId}`, {
                    method: 'DELETE'
                });
                console.log('🗑️  Test account cleaned up');
            } catch (e) {
                console.log('⚠️  Could not clean up test account');
            }
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Server is not running');
        console.log('2. Wrong port number (check your server config)');
        console.log('3. Database connection issue');
        console.log('4. Type column not added to Person_Account table');
        console.log('5. Make sure to install: npm install node-fetch');
    }
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('🏁 Type Column Integration Test Complete');
}

// Run the test
console.log('🧪 Person_Account Type Column Test Suite');
console.log('Testing Type column integration across all APIs');
console.log('');

testTypeColumn();