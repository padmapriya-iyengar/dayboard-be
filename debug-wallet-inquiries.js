const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function diagnoseWalletInquiries() {
    console.log('🔍 Diagnosing Wallet Inquiries - Person Distribution');
    console.log('=' .repeat(70));
    
    try {
        // Test 1: Check all accounts and their types
        console.log('📋 Test 1: Check All Accounts and Types');
        console.log('-' .repeat(50));
        
        const accountsResponse = await fetch(`${BASE_URL}/accounts?limit=100`);
        const accountsData = await accountsResponse.json();
        
        if (accountsData.status === 'success') {
            console.log(`Total accounts found: ${accountsData.data.length}`);
            
            // Group accounts by person and type
            const accountsByPerson = {};
            const accountsByType = {};
            
            accountsData.data.forEach(account => {
                const person = account.PersonName || 'Unknown';
                const type = account.Type || 'No Type';
                
                if (!accountsByPerson[person]) {
                    accountsByPerson[person] = {};
                }
                if (!accountsByPerson[person][type]) {
                    accountsByPerson[person][type] = 0;
                }
                accountsByPerson[person][type]++;
                
                if (!accountsByType[type]) {
                    accountsByType[type] = 0;
                }
                accountsByType[type]++;
            });
            
            console.log('\nAccounts by Type:');
            Object.keys(accountsByType).forEach(type => {
                console.log(`  ${type}: ${accountsByType[type]} accounts`);
            });
            
            console.log('\nAccounts by Person and Type:');
            Object.keys(accountsByPerson).forEach(person => {
                console.log(`\n${person}:`);
                Object.keys(accountsByPerson[person]).forEach(type => {
                    console.log(`  ${type}: ${accountsByPerson[person][type]} accounts`);
                });
            });
            
            // Check specifically for WALLET accounts
            const walletAccounts = accountsData.data.filter(a => a.Type === 'WALLET');
            console.log(`\n🎯 WALLET Accounts: ${walletAccounts.length} found`);
            
            if (walletAccounts.length > 0) {
                console.log('\nWALLET Account Details:');
                console.log('ID  | Account Name     | Person Name      | Currency');
                console.log('-' .repeat(60));
                
                walletAccounts.forEach(account => {
                    const id = account.Id.toString().padEnd(3);
                    const accountName = (account.Account || 'N/A').substring(0, 15).padEnd(15);
                    const personName = (account.PersonName || 'Unknown').substring(0, 15).padEnd(15);
                    const currency = account.Currency || 'N/A';
                    
                    console.log(`${id} | ${accountName} | ${personName} | ${currency}`);
                });
                
                // Check unique persons with WALLET accounts
                const uniquePersonsWithWallet = [...new Set(walletAccounts.map(a => a.PersonName))];
                console.log(`\n📊 Unique persons with WALLET accounts: ${uniquePersonsWithWallet.length}`);
                uniquePersonsWithWallet.forEach((person, index) => {
                    console.log(`  ${index + 1}. ${person}`);
                });
            } else {
                console.log('❌ No WALLET type accounts found!');
            }
        } else {
            console.log('❌ Failed to retrieve accounts:', accountsData.message);
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 2: Check expenses and their account associations
        console.log('💰 Test 2: Check Expenses and Account Associations');
        console.log('-' .repeat(50));
        
        const expensesResponse = await fetch(`${BASE_URL}/expenses?limit=50`);
        const expensesData = await expensesResponse.json();
        
        if (expensesData.status === 'success') {
            console.log(`Total expenses found: ${expensesData.data.length}`);
            
            // Group expenses by account type and person
            const expensesByType = {};
            const expensesByPerson = {};
            
            expensesData.data.forEach(expense => {
                const person = expense.PersonName || 'Unknown';
                const type = expense.AccountType || 'No Type';
                
                if (!expensesByType[type]) {
                    expensesByType[type] = 0;
                }
                expensesByType[type]++;
                
                if (!expensesByPerson[person]) {
                    expensesByPerson[person] = {};
                }
                if (!expensesByPerson[person][type]) {
                    expensesByPerson[person][type] = 0;
                }
                expensesByPerson[person][type]++;
            });
            
            console.log('\nExpenses by Account Type:');
            Object.keys(expensesByType).forEach(type => {
                console.log(`  ${type}: ${expensesByType[type]} expenses`);
            });
            
            console.log('\nExpenses by Person and Account Type:');
            Object.keys(expensesByPerson).forEach(person => {
                console.log(`\n${person}:`);
                Object.keys(expensesByPerson[person]).forEach(type => {
                    console.log(`  ${type}: ${expensesByPerson[person][type]} expenses`);
                });
            });
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 3: Test wallet inquiries endpoint specifically
        console.log('🎯 Test 3: Test Wallet Inquiries Endpoint');
        console.log('-' .repeat(50));
        
        const walletResponse = await fetch(`${BASE_URL}/expenses/wallet-inquiries?limit=50`);
        const walletData = await walletResponse.json();
        
        console.log('Wallet Inquiries Status:', walletResponse.status);
        
        if (walletData.status === 'success') {
            console.log(`Wallet inquiries found: ${walletData.data.length}`);
            console.log(`Total available: ${walletData.pagination?.total || 0}`);
            
            if (walletData.data.length > 0) {
                // Group wallet inquiries by person
                const walletByPerson = {};
                
                walletData.data.forEach(inquiry => {
                    const person = inquiry.PersonName || 'Unknown';
                    if (!walletByPerson[person]) {
                        walletByPerson[person] = [];
                    }
                    walletByPerson[person].push(inquiry);
                });
                
                console.log('\nWallet Inquiries by Person:');
                Object.keys(walletByPerson).forEach(person => {
                    console.log(`\n${person}: ${walletByPerson[person].length} wallet inquiries`);
                    
                    // Show sample inquiries for this person
                    walletByPerson[person].slice(0, 3).forEach((inquiry, index) => {
                        console.log(`  ${index + 1}. Amount: ${inquiry.Amount}, Account: ${inquiry.AccountName}, Date: ${inquiry.TxnDate?.substring(0, 10)}`);
                    });
                    
                    if (walletByPerson[person].length > 3) {
                        console.log(`  ... and ${walletByPerson[person].length - 3} more`);
                    }
                });
                
                const uniquePersonsInWallet = Object.keys(walletByPerson);
                console.log(`\n📊 Unique persons in wallet inquiries: ${uniquePersonsInWallet.length}`);
                
                if (uniquePersonsInWallet.length === 1) {
                    console.log('❌ ISSUE CONFIRMED: Only one person appears in wallet inquiries');
                    console.log(`   Only person: ${uniquePersonsInWallet[0]}`);
                } else {
                    console.log('✅ Multiple persons found in wallet inquiries');
                }
            } else {
                console.log('❌ No wallet inquiries found');
            }
        } else {
            console.log('❌ Failed to retrieve wallet inquiries:', walletData.message);
        }
        
        console.log('\n' + '=' .repeat(70) + '\n');
        
        // Test 4: Check if there are expenses with WALLET accounts but from other people
        console.log('🔍 Test 4: Direct Database Analysis Simulation');
        console.log('-' .repeat(50));
        
        // Get all expenses and check if any belong to WALLET accounts from other people
        const allExpensesResponse = await fetch(`${BASE_URL}/expenses?limit=200`);
        const allExpensesData = await allExpensesResponse.json();
        
        if (allExpensesData.status === 'success') {
            console.log(`Checking ${allExpensesData.data.length} Transaction expenses...`);
            
            // Find expenses from accounts that might belong to other people
            const personAccountMap = {};
            allExpensesData.data.forEach(expense => {
                const person = expense.PersonName;
                const accountId = expense.Account_Id;
                if (!personAccountMap[person]) {
                    personAccountMap[person] = new Set();
                }
                personAccountMap[person].add(accountId);
            });
            
            console.log('\nPerson-Account mapping from Transaction expenses:');
            Object.keys(personAccountMap).forEach(person => {
                console.log(`${person}: ${personAccountMap[person].size} unique accounts`);
            });
            
            // Now check if any of these accounts might also have WALLET type
            const walletAccountIds = walletAccounts.map(a => a.Id);
            console.log(`\nWALLET account IDs: [${walletAccountIds.join(', ')}]`);
            
            // Check if expenses exist for WALLET account IDs
            const expensesInWalletAccounts = allExpensesData.data.filter(e => 
                walletAccountIds.includes(e.Account_Id)
            );
            
            console.log(`\nExpenses in WALLET account IDs: ${expensesInWalletAccounts.length}`);
            
            if (expensesInWalletAccounts.length > 0) {
                console.log('⚠️ Found Transaction expenses in WALLET account IDs!');
                console.log('This suggests these accounts have both Transaction and WALLET types.');
                
                expensesInWalletAccounts.forEach((expense, index) => {
                    console.log(`${index + 1}. Account ${expense.Account_Id} (${expense.AccountName}) - ${expense.PersonName} - Amount: ${expense.Amount}`);
                });
            } else {
                console.log('✅ No Transaction expenses found in WALLET account IDs');
                console.log('This means WALLET accounts are separate from Transaction accounts');
            }
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Make sure:');
        console.log('1. Server is running (npm run dev)');
        console.log('2. Database is connected');
        console.log('3. Port 3002 is correct');
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('🏁 Wallet Inquiries Diagnosis Complete');
    console.log('');
    console.log('📝 Possible Reasons for Single Person Results:');
    console.log('1. Only one person has WALLET type accounts');
    console.log('2. Only one person has expenses in WALLET accounts');
    console.log('3. Data setup issue - other persons missing WALLET accounts');
    console.log('4. Database constraint or data entry issue');
    console.log('');
    console.log('💡 Solutions:');
    console.log('1. Create WALLET type accounts for other persons');
    console.log('2. Add expenses to existing WALLET accounts of other persons');
    console.log('3. Check if account Type field is correctly populated');
    console.log('4. Verify expense data includes all persons');
}

console.log('🧪 Wallet Inquiries Diagnosis');
console.log('Investigating why only one person appears in wallet inquiries');
console.log('');

diagnoseWalletInquiries();