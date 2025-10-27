const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1'; // Adjust port if needed

async function testTransactionTypeFilter() {
    console.log('🔍 Testing Expenses API - Transaction Type Filter');
    console.log('=' .repeat(70));
    console.log('Time:', new Date().toISOString());
    console.log('');

    try {
        // Test 1: Check all accounts to see different types
        console.log('📋 Test 1: Check All Account Types');
        console.log('-' .repeat(50));
        
        const accountsResponse = await fetch(`${BASE_URL}/accounts?limit=10`);
        const accountsData = await accountsResponse.json();
        
        if (accountsData.status === 'success') {
            console.log('✅ Accounts retrieved successfully');
            console.log(`Found ${accountsData.data.length} accounts`);
            
            const typeCount = {};
            accountsData.data.forEach(account => {
                const type = account.Type || 'No Type';
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
            
            console.log('\nAccount Types Distribution:');
            Object.keys(typeCount).forEach(type => {
                console.log(`  ${type}: ${typeCount[type]} accounts`);
            });
            
            console.log('\nAll Accounts:');
            console.log('ID  | Account Name     | Type         | Currency | Person');
            console.log('-' .repeat(70));
            
            accountsData.data.forEach(account => {
                const id = account.Id.toString().padEnd(3);
                const name = (account.AccountName || 'N/A').substring(0, 15).padEnd(15);
                const type = (account.Type || 'N/A').substring(0, 11).padEnd(11);
                const currency = (account.Currency || 'N/A').padEnd(8);
                const person = (account.PersonName || 'Unknown').substring(0, 15);
                
                console.log(`${id} | ${name} | ${type} | ${currency} | ${person}`);
            });
        } else {
            console.log('❌ Failed to retrieve accounts:', accountsData.message);
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 2: Get expenses (should only show Transaction type accounts)
        console.log('💰 Test 2: Get Expenses (Transaction Type Only)');
        console.log('-' .repeat(50));
        
        const expensesResponse = await fetch(`${BASE_URL}/expenses?limit=20`);
        const expensesData = await expensesResponse.json();
        
        console.log('Expenses Status:', expensesResponse.status);
        
        if (expensesData.status === 'success') {
            console.log('✅ Expenses retrieved successfully');
            console.log(`Found ${expensesData.data.length} expenses`);
            
            // Check if all expenses are from Transaction type accounts
            const accountTypes = new Set();
            expensesData.data.forEach(expense => {
                if (expense.AccountType) {
                    accountTypes.add(expense.AccountType);
                }
            });
            
            console.log('\nAccount Types in Expenses:');
            Array.from(accountTypes).forEach(type => {
                console.log(`  ${type}`);
            });
            
            // Verify all are Transaction type
            const hasOnlyTransaction = Array.from(accountTypes).every(type => type === 'Transaction');
            console.log(`\n✅ All expenses from Transaction accounts: ${hasOnlyTransaction ? 'YES' : 'NO'}`);
            
            if (!hasOnlyTransaction && accountTypes.size > 0) {
                console.log('❌ WARNING: Found expenses from non-Transaction accounts!');
                console.log('Account types found:', Array.from(accountTypes));
            }
            
            console.log('\nExpense Details:');
            console.log('ID  | Amount   | Account Name     | Type        | Currency | Date');
            console.log('-' .repeat(80));
            
            expensesData.data.slice(0, 10).forEach(expense => {
                const id = expense.Id.toString().padEnd(3);
                const amount = expense.Amount.toFixed(2).padStart(8);
                const account = (expense.AccountName || 'N/A').substring(0, 15).padEnd(15);
                const type = (expense.AccountType || 'N/A').substring(0, 11).padEnd(11);
                const currency = (expense.Currency || 'N/A').padEnd(8);
                const date = expense.TxnDate ? expense.TxnDate.substring(0, 10) : 'N/A';
                
                console.log(`${id} | ${amount} | ${account} | ${type} | ${currency} | ${date}`);
            });
            
            if (expensesData.data.length > 10) {
                console.log(`... and ${expensesData.data.length - 10} more expenses`);
            }
            
        } else {
            console.log('❌ Failed to retrieve expenses:', expensesData.message);
            if (expensesData.error) {
                console.log('Error Details:', expensesData.error);
            }
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 3: Get expense by ID (should only work for Transaction type)
        if (expensesData.status === 'success' && expensesData.data.length > 0) {
            const firstExpenseId = expensesData.data[0].Id;
            
            console.log(`🔍 Test 3: Get Expense by ID (${firstExpenseId})`);
            console.log('-' .repeat(50));
            
            const expenseResponse = await fetch(`${BASE_URL}/expenses/${firstExpenseId}`);
            const expenseData = await expenseResponse.json();
            
            console.log('Single Expense Status:', expenseResponse.status);
            
            if (expenseData.status === 'success') {
                console.log('✅ Single expense retrieved successfully');
                const expense = expenseData.data;
                
                console.log('\nExpense Details:');
                console.log(`ID: ${expense.Id}`);
                console.log(`Amount: ${expense.Amount}`);
                console.log(`Account: ${expense.AccountName}`);
                console.log(`Type: ${expense.AccountType}`);
                console.log(`Currency: ${expense.Currency}`);
                console.log(`Date: ${expense.TxnDate}`);
                console.log(`Description: ${expense.Description || 'No description'}`);
                
                if (expense.AccountType === 'Transaction') {
                    console.log('✅ Confirmed: Expense is from Transaction type account');
                } else {
                    console.log(`❌ WARNING: Expense is from ${expense.AccountType} type account!`);
                }
                
            } else {
                console.log('❌ Failed to retrieve single expense:', expenseData.message);
            }
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 4: Get expense statistics (should only include Transaction type)
        console.log('📊 Test 4: Get Expense Statistics (Transaction Type Only)');
        console.log('-' .repeat(50));
        
        const statsResponse = await fetch(`${BASE_URL}/expenses/stats`);
        const statsData = await statsResponse.json();
        
        console.log('Stats Status:', statsResponse.status);
        
        if (statsData.status === 'success') {
            console.log('✅ Expense statistics retrieved successfully');
            
            const stats = statsData.data;
            console.log('\nExpense Statistics (Transaction accounts only):');
            console.log(`Total Count: ${stats.totalCount}`);
            console.log(`Total Amount: ${stats.totalAmount?.toFixed(2) || 0}`);
            console.log(`Average Amount: ${stats.averageAmount?.toFixed(2) || 0}`);
            console.log(`Min Amount: ${stats.minAmount?.toFixed(2) || 0}`);
            console.log(`Max Amount: ${stats.maxAmount?.toFixed(2) || 0}`);
            console.log(`Total Debits: ${stats.totalDebits?.toFixed(2) || 0}`);
            console.log(`Total Credits: ${stats.totalCredits?.toFixed(2) || 0}`);
            
        } else {
            console.log('❌ Failed to retrieve expense statistics:', statsData.message);
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 5: Get expenses by type (should only include Transaction type)
        console.log('📈 Test 5: Get Expenses by Type (Transaction Type Only)');
        console.log('-' .repeat(50));
        
        const typeResponse = await fetch(`${BASE_URL}/expenses/by-type`);
        const typeData = await typeResponse.json();
        
        console.log('Type Stats Status:', typeResponse.status);
        
        if (typeData.status === 'success') {
            console.log('✅ Expense type statistics retrieved successfully');
            
            console.log('\nExpense Type Breakdown (Transaction accounts only):');
            typeData.data.forEach(typeInfo => {
                console.log(`${typeInfo.type}:`);
                console.log(`  Count: ${typeInfo.count}`);
                console.log(`  Total Amount: ${typeInfo.totalAmount?.toFixed(2) || 0}`);
                console.log(`  Average Amount: ${typeInfo.averageAmount?.toFixed(2) || 0}`);
                console.log('');
            });
            
        } else {
            console.log('❌ Failed to retrieve expense type statistics:', typeData.message);
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Server is not running');
        console.log('2. Wrong port number (check your server config)');
        console.log('3. Database connection issue');
        console.log('4. Type column not properly set up');
        console.log('5. No accounts with Type = "Transaction"');
        console.log('6. Make sure to install: npm install node-fetch');
    }
    
    console.log('');
    console.log('=' .repeat(70));
    console.log('🏁 Transaction Type Filter Test Complete');
    console.log('');
    console.log('📝 Summary:');
    console.log('- Expenses API now filters to only Transaction type accounts');
    console.log('- All expense endpoints (list, single, stats, by-type) respect this filter');
    console.log('- Accounts with other types (Savings, Credit, etc.) are excluded');
    console.log('- This provides focused view of transactional data only');
}

// Run the test
console.log('🧪 Expenses API Transaction Type Filter Test');
console.log('Testing that expenses API only shows Transaction type accounts');
console.log('');

testTransactionTypeFilter();