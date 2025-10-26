const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1'; // Adjust port if needed

async function testSimplifiedPortfolio() {
    console.log('🔍 Testing Simplified Portfolio API (Balance-based)');
    console.log('=' .repeat(70));
    console.log('Time:', new Date().toISOString());
    console.log('');

    try {
        // Test 1: Get all portfolios with balance data
        console.log('📊 Test 1: Get All Portfolios (Balance-based)');
        console.log('-' .repeat(50));
        
        const portfolioResponse = await fetch(`${BASE_URL}/portfolio`);
        const portfolioData = await portfolioResponse.json();
        
        console.log('Status Code:', portfolioResponse.status);
        console.log('Response Status:', portfolioData.status);
        
        if (portfolioData.status === 'success') {
            console.log('✅ Portfolio retrieved successfully');
            
            const summary = portfolioData.data.summary;
            console.log('\n📈 Portfolio Summary:');
            console.log(`- Total Persons: ${summary.totalPersons}`);
            console.log(`- Total Accounts: ${summary.totalAccounts}`);
            console.log(`- Total Expenses: ${summary.totalExpenses} (not calculated)`);
            console.log(`- Conversion Rate (AED→INR): ${summary.conversionRate.aedToInr}`);
            
            console.log('\n💰 Grand Totals (Balance-based):');
            console.log('AED:', {
                total: summary.grandTotals.aed.totalAmount.toFixed(2),
                debit: summary.grandTotals.aed.debitAmount.toFixed(2),
                credit: summary.grandTotals.aed.creditAmount.toFixed(2),
                net: summary.grandTotals.aed.netAmount.toFixed(2)
            });
            console.log('INR:', {
                total: summary.grandTotals.inr.totalAmount.toFixed(2),
                debit: summary.grandTotals.inr.debitAmount.toFixed(2),
                credit: summary.grandTotals.inr.creditAmount.toFixed(2),
                net: summary.grandTotals.inr.netAmount.toFixed(2)
            });
            
            console.log('\n👥 Person Portfolios (Balance-based):');
            console.log('=' .repeat(80));
            console.log('Person Name      | Account Name     | Currency | Type     | Balance   | Converted');
            console.log('-' .repeat(80));
            
            portfolioData.data.portfolios.forEach((portfolio) => {
                if (portfolio.accounts.length === 0) {
                    const personName = portfolio.personName.substring(0, 15).padEnd(15);
                    console.log(`${personName} | No accounts found`);
                } else {
                    portfolio.accounts.forEach((account, index) => {
                        const personName = index === 0 ? portfolio.personName.substring(0, 15).padEnd(15) : ' '.repeat(15);
                        const accountName = account.accountName.substring(0, 15).padEnd(15);
                        const currency = account.currency.padEnd(8);
                        const type = (account.accountType || 'N/A').substring(0, 8).padEnd(8);
                        const balance = account.amounts.netAmount.toFixed(2).padStart(9);
                        
                        // Show converted amount in the other currency
                        const convertedCurrency = account.currency === 'AED' ? 'INR' : 'AED';
                        const convertedAmount = account.currency === 'AED' 
                            ? (account.amounts.netAmount * 23).toFixed(2)
                            : (account.amounts.netAmount / 23).toFixed(2);
                        const converted = `${convertedAmount} ${convertedCurrency}`;
                        
                        console.log(`${personName} | ${accountName} | ${currency} | ${type} | ${balance} | ${converted}`);
                    });
                }
                
                // Show person totals
                console.log('-' .repeat(80));
                console.log(`${portfolio.personName} TOTALS:`);
                console.log(`  AED: ${portfolio.totals.aed.netAmount.toFixed(2)} | INR: ${portfolio.totals.inr.netAmount.toFixed(2)}`);
                console.log('=' .repeat(80));
            });
            
        } else {
            console.log('❌ Failed to retrieve portfolio:', portfolioData.message);
            if (portfolioData.error) {
                console.log('Error Details:', portfolioData.error);
            }
        }
        
        console.log('');
        
        // Test 2: Get specific person portfolio
        if (portfolioData.status === 'success' && portfolioData.data.portfolios.length > 0) {
            const firstPersonId = portfolioData.data.portfolios[0].personId;
            
            console.log(`👤 Test 2: Get Person Portfolio (ID: ${firstPersonId})`);
            console.log('-' .repeat(50));
            
            const personResponse = await fetch(`${BASE_URL}/portfolio/person/${firstPersonId}`);
            const personData = await personResponse.json();
            
            console.log('Status:', personResponse.status);
            
            if (personData.status === 'success') {
                console.log('✅ Person portfolio retrieved successfully');
                const person = personData.data;
                
                console.log(`\nPerson: ${person.personName} (ID: ${person.personId})`);
                console.log('Accounts:');
                
                person.accounts.forEach((account, index) => {
                    console.log(`  ${index + 1}. ${account.accountName}`);
                    console.log(`     Currency: ${account.currency}`);
                    console.log(`     Type: ${account.accountType || 'N/A'}`);
                    console.log(`     Balance: ${account.amounts.netAmount.toFixed(2)} ${account.currency}`);
                    
                    if (account.convertedAmounts) {
                        const aedAmount = account.convertedAmounts.aed.netAmount.toFixed(2);
                        const inrAmount = account.convertedAmounts.inr.netAmount.toFixed(2);
                        console.log(`     Converted: ${aedAmount} AED | ${inrAmount} INR`);
                    }
                    console.log('');
                });
                
                console.log('Person Totals:');
                console.log(`  AED: ${person.totals.aed.netAmount.toFixed(2)}`);
                console.log(`  INR: ${person.totals.inr.netAmount.toFixed(2)}`);
                
            } else {
                console.log('❌ Failed to retrieve person portfolio:', personData.message);
            }
        }
        
        console.log('');
        
        // Test 3: Compare with account balance data
        console.log('🔍 Test 3: Compare with Direct Account Balances');
        console.log('-' .repeat(50));
        
        const accountsResponse = await fetch(`${BASE_URL}/accounts?limit=10`);
        const accountsData = await accountsResponse.json();
        
        if (accountsData.status === 'success') {
            console.log('✅ Direct account data retrieved');
            console.log('\nDirect Account Balances:');
            console.log('ID  | Account Name     | Currency | Balance   | Type');
            console.log('-' .repeat(60));
            
            accountsData.data.forEach(account => {
                const id = account.Id.toString().padEnd(3);
                const name = (account.AccountName || 'N/A').substring(0, 15).padEnd(15);
                const currency = (account.Currency || 'N/A').padEnd(8);
                const balance = (account.Balance || 0).toFixed(2).padStart(9);
                const type = (account.Type || 'N/A').substring(0, 8);
                
                console.log(`${id} | ${name} | ${currency} | ${balance} | ${type}`);
            });
        } else {
            console.log('❌ Failed to retrieve account data');
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Server is not running');
        console.log('2. Wrong port number (check your server config)');
        console.log('3. Database connection issue');
        console.log('4. Balance column not added to Person_Account table');
        console.log('5. Database trigger not working correctly');
        console.log('6. Make sure to install: npm install node-fetch');
    }
    
    console.log('');
    console.log('=' .repeat(70));
    console.log('🏁 Simplified Portfolio Test Complete');
    console.log('');
    console.log('📝 Key Changes:');
    console.log('- Portfolio now uses Balance column from Person_Account');
    console.log('- No more complex expense calculations');
    console.log('- Balance is maintained by database trigger');
    console.log('- Much faster and simpler queries');
}

// Run the test
console.log('🧪 Simplified Portfolio API Test Suite');
console.log('Testing balance-based portfolio calculations');
console.log('');

testSimplifiedPortfolio();