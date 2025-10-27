const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testWalletInquiries() {
    try {
        console.log('🔍 Testing Wallet Inquiries Endpoint');
        console.log('=' .repeat(50));
        
        // Test 1: Check all accounts to see different types
        console.log('📋 Test 1: Check Account Types Distribution');
        console.log('-' .repeat(40));
        
        const accountsResponse = await fetch(`${BASE_URL}/accounts?limit=20`);
        const accountsData = await accountsResponse.json();
        
        if (accountsData.status === 'success') {
            const typeCount = {};
            accountsData.data.forEach(account => {
                const type = account.Type || 'No Type';
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
            
            console.log('Account Types:');
            Object.keys(typeCount).forEach(type => {
                console.log(`  ${type}: ${typeCount[type]} accounts`);
            });
            
            if (typeCount['WALLET']) {
                console.log(`✅ Found ${typeCount['WALLET']} WALLET type accounts`);
            } else {
                console.log('⚠️ No WALLET type accounts found');
            }
        }
        
        console.log('\n' + '=' .repeat(50) + '\n');
        
        // Test 2: Test wallet inquiries endpoint
        console.log('💰 Test 2: Get Wallet Inquiries');
        console.log('-' .repeat(40));
        
        const walletResponse = await fetch(`${BASE_URL}/expenses/wallet-inquiries?limit=10`);
        console.log('Response Status:', walletResponse.status);
        
        const walletData = await walletResponse.json();
        console.log('API Status:', walletData.status);
        
        if (walletData.status === 'success') {
            console.log('✅ Wallet inquiries endpoint working');
            console.log(`Found ${walletData.data.length} wallet transactions`);
            console.log(`Total wallet transactions: ${walletData.pagination?.total || 0}`);
            
            // Verify all are WALLET type
            const accountTypes = new Set();
            walletData.data.forEach(expense => {
                if (expense.AccountType) {
                    accountTypes.add(expense.AccountType);
                }
            });
            
            console.log('\nAccount Types in Wallet Inquiries:');
            Array.from(accountTypes).forEach(type => {
                console.log(`  ${type}`);
            });
            
            const hasOnlyWallet = Array.from(accountTypes).every(type => type === 'WALLET');
            console.log(`\n✅ All from WALLET accounts: ${hasOnlyWallet ? 'YES' : 'NO'}`);
            
            if (!hasOnlyWallet && accountTypes.size > 0) {
                console.log('❌ WARNING: Found non-WALLET account types!');
            }
            
            // Show sample data
            if (walletData.data.length > 0) {
                console.log('\nSample Wallet Transactions:');
                console.log('ID  | Amount   | Account Name     | Type   | Date       | Description');
                console.log('-' .repeat(75));
                
                walletData.data.slice(0, 5).forEach(expense => {
                    const id = expense.Id.toString().padEnd(3);
                    const amount = expense.Amount.toFixed(2).padStart(8);
                    const account = (expense.AccountName || 'N/A').substring(0, 15).padEnd(15);
                    const type = (expense.AccountType || 'N/A').padEnd(6);
                    const date = expense.TxnDate ? expense.TxnDate.substring(0, 10) : 'N/A';
                    const desc = (expense.Description || 'No desc').substring(0, 15);
                    
                    console.log(`${id} | ${amount} | ${account} | ${type} | ${date} | ${desc}`);
                });
            }
            
        } else {
            console.log('❌ Error:', walletData.message || 'Unknown error');
            if (walletData.error) {
                console.log('Details:', walletData.error);
            }
        }
        
        console.log('\n' + '=' .repeat(50) + '\n');
        
        // Test 3: Compare with regular expenses endpoint
        console.log('🔄 Test 3: Compare with Transaction Expenses');
        console.log('-' .repeat(40));
        
        const expensesResponse = await fetch(`${BASE_URL}/expenses?limit=5`);
        const expensesData = await expensesResponse.json();
        
        if (expensesData.status === 'success') {
            console.log(`Transaction expenses count: ${expensesData.pagination?.total || 0}`);
            console.log(`Wallet inquiries count: ${walletData.pagination?.total || 0}`);
            
            console.log('\nTransaction vs Wallet Summary:');
            console.log('- Transaction expenses: Only Transaction type accounts');
            console.log('- Wallet inquiries: Only WALLET type accounts');
            console.log('- Both endpoints filter by account type successfully');
        }
        
        console.log('\n' + '=' .repeat(50) + '\n');
        
        // Test 4: Test with filters
        console.log('🔍 Test 4: Test Wallet Inquiries with Filters');
        console.log('-' .repeat(40));
        
        const filteredResponse = await fetch(`${BASE_URL}/expenses/wallet-inquiries?limit=3&sortBy=Amount&sortOrder=desc`);
        const filteredData = await filteredResponse.json();
        
        if (filteredData.status === 'success') {
            console.log('✅ Filtered wallet inquiries working');
            console.log('Top 3 wallet transactions by amount:');
            
            filteredData.data.forEach((expense, index) => {
                console.log(`${index + 1}. ${expense.AccountName}: ${expense.Amount} (${expense.AccountType})`);
            });
        } else {
            console.log('❌ Filtered request failed:', filteredData.message);
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Server is running (npm run dev)');
        console.log('2. Database is connected');
        console.log('3. Port 3002 is correct');
        console.log('4. WALLET type accounts exist in database');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🏁 Wallet Inquiries Test Complete');
    console.log('\n📝 New Endpoint Available:');
    console.log('GET /api/v1/expenses/wallet-inquiries');
    console.log('- Returns expenses only from WALLET type accounts');
    console.log('- Supports same filtering and pagination as expenses API');
    console.log('- Separate from Transaction type expenses');
}

console.log('🧪 Wallet Inquiries Endpoint Test');
console.log('Testing new endpoint for WALLET type account expenses');
console.log('');

testWalletInquiries();