const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1'; // Using port 3002 as mentioned in error

async function testPortfolioFix() {
    console.log('🔧 Testing Portfolio API Fix');
    console.log('=' .repeat(50));
    console.log('Time:', new Date().toISOString());
    console.log('URL:', `${BASE_URL}/portfolio`);
    console.log('');

    try {
        console.log('📊 Calling GET /api/v1/portfolio...');
        
        const response = await fetch(`${BASE_URL}/portfolio`);
        const data = await response.json();
        
        console.log('Status Code:', response.status);
        console.log('Response Status:', data.status);
        
        if (data.status === 'success') {
            console.log('✅ SUCCESS! Portfolio API is working correctly');
            console.log('');
            
            // Display summary
            const summary = data.data.summary;
            console.log('📈 Portfolio Summary:');
            console.log(`   Total Persons: ${summary.totalPersons}`);
            console.log(`   Total Accounts: ${summary.totalAccounts}`);
            console.log(`   Total Expenses: ${summary.totalExpenses}`);
            console.log(`   Conversion Rate (AED→INR): ${summary.conversionRate.aedToInr}`);
            console.log('');
            
            console.log('💰 Grand Totals:');
            console.log(`   AED Total: ${summary.grandTotals.aed.totalAmount} (Net: ${summary.grandTotals.aed.netAmount})`);
            console.log(`   INR Total: ${summary.grandTotals.inr.totalAmount} (Net: ${summary.grandTotals.inr.netAmount})`);
            console.log('');
            
            // Display person portfolios summary
            console.log('👥 Person Portfolios:');
            data.data.portfolios.forEach((portfolio, index) => {
                console.log(`   ${index + 1}. ${portfolio.personName} (ID: ${portfolio.personId})`);
                console.log(`      Accounts: ${portfolio.accounts.length}`);
                console.log(`      AED Total: ${portfolio.totals.aed.totalAmount}`);
                console.log(`      INR Total: ${portfolio.totals.inr.totalAmount}`);
                
                if (portfolio.accounts.length > 0) {
                    portfolio.accounts.forEach((account, accIndex) => {
                        console.log(`         ${accIndex + 1}. ${account.accountName} (${account.currency}): ${account.amounts.totalAmount} ${account.currency}`);
                    });
                }
                console.log('');
            });
            
        } else if (data.status === 'error') {
            console.log('❌ ERROR! Portfolio API returned an error:');
            console.log('Message:', data.message);
            if (data.error) {
                console.log('Error Details:', data.error);
            }
            
            // Check if it's still the SQL error
            if (data.error && data.error.includes('GROUP BY clause')) {
                console.log('');
                console.log('🚨 The SQL GROUP BY error is still present!');
                console.log('💡 The fix may not have been applied correctly.');
            } else {
                console.log('');
                console.log('💡 This is a different error - SQL fix was successful!');
            }
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Server is not running on http://localhost:3002');
        console.log('2. Port 3002 is not correct (check your server config)');
        console.log('3. Network connectivity issue');
        console.log('4. Make sure to install: npm install node-fetch');
    }
    
    console.log('');
    console.log('=' .repeat(50));
    console.log('🏁 Test Complete');
}

// Run the test
testPortfolioFix();