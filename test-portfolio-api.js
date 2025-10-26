const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testPortfolioAPI() {
    console.log('🚀 Testing Portfolio API Endpoints\n');

    try {
        // Test 1: Get all portfolios
        console.log('📊 Test 1: Get All Portfolios');
        console.log('=' .repeat(50));
        
        const allPortfoliosResponse = await fetch(`${BASE_URL}/portfolio`);
        const allPortfoliosData = await allPortfoliosResponse.json();
        
        console.log('Status:', allPortfoliosResponse.status);
        console.log('Response:', JSON.stringify(allPortfoliosData, null, 2));
        
        if (allPortfoliosData.status === 'success') {
            console.log('✅ All portfolios retrieved successfully');
            
            // Display summary
            const summary = allPortfoliosData.data.summary;
            console.log('\n📈 Portfolio Summary:');
            console.log(`- Total Persons: ${summary.totalPersons}`);
            console.log(`- Total Accounts: ${summary.totalAccounts}`);
            console.log(`- Total Expenses: ${summary.totalExpenses}`);
            console.log(`- Conversion Rate (AED→INR): ${summary.conversionRate.aedToInr}`);
            console.log(`- Conversion Rate (INR→AED): ${summary.conversionRate.inrToAed}`);
            
            console.log('\n💰 Grand Totals:');
            console.log('AED:', {
                total: summary.grandTotals.aed.totalAmount,
                debit: summary.grandTotals.aed.debitAmount,
                credit: summary.grandTotals.aed.creditAmount,
                net: summary.grandTotals.aed.netAmount
            });
            console.log('INR:', {
                total: summary.grandTotals.inr.totalAmount,
                debit: summary.grandTotals.inr.debitAmount,
                credit: summary.grandTotals.inr.creditAmount,
                net: summary.grandTotals.inr.netAmount
            });
            
            // Display person portfolios
            console.log('\n👥 Person Portfolios:');
            allPortfoliosData.data.portfolios.forEach((portfolio, index) => {
                console.log(`\n${index + 1}. ${portfolio.personName} (ID: ${portfolio.personId})`);
                console.log(`   Accounts: ${portfolio.accounts.length}`);
                console.log(`   AED Total: ${portfolio.totals.aed.totalAmount} (Net: ${portfolio.totals.aed.netAmount})`);
                console.log(`   INR Total: ${portfolio.totals.inr.totalAmount} (Net: ${portfolio.totals.inr.netAmount})`);
                
                portfolio.accounts.forEach((account, accIndex) => {
                    console.log(`     ${accIndex + 1}. ${account.accountName} (${account.currency})`);
                    console.log(`        Original: ${account.amounts.totalAmount} ${account.currency} (${account.amounts.expenseCount} expenses)`);
                    console.log(`        Net: ${account.amounts.netAmount} ${account.currency}`);
                });
            });
            
        } else {
            console.log('❌ Failed to retrieve portfolios:', allPortfoliosData.message);
        }
        
        console.log('\n' + '=' .repeat(80) + '\n');
        
        // Test 2: Get specific person portfolio (if any persons exist)
        if (allPortfoliosData.status === 'success' && allPortfoliosData.data.portfolios.length > 0) {
            const firstPersonId = allPortfoliosData.data.portfolios[0].personId;
            
            console.log(`👤 Test 2: Get Person Portfolio (ID: ${firstPersonId})`);
            console.log('=' .repeat(50));
            
            const personResponse = await fetch(`${BASE_URL}/portfolio/person/${firstPersonId}`);
            const personData = await personResponse.json();
            
            console.log('Status:', personResponse.status);
            console.log('Response:', JSON.stringify(personData, null, 2));
            
            if (personData.status === 'success') {
                console.log('✅ Person portfolio retrieved successfully');
            } else {
                console.log('❌ Failed to retrieve person portfolio:', personData.message);
            }
            
            console.log('\n' + '=' .repeat(80) + '\n');
        }
        
        // Test 3: Get exchange rates
        console.log('💱 Test 3: Get Exchange Rates');
        console.log('=' .repeat(50));
        
        const ratesResponse = await fetch(`${BASE_URL}/portfolio/exchange-rates`);
        const ratesData = await ratesResponse.json();
        
        console.log('Status:', ratesResponse.status);
        console.log('Response:', JSON.stringify(ratesData, null, 2));
        
        if (ratesData.status === 'success') {
            console.log('✅ Exchange rates retrieved successfully');
            console.log(`💱 AED to INR: ${ratesData.data.aedToInr}`);
            console.log(`💱 INR to AED: ${ratesData.data.inrToAed}`);
        } else {
            console.log('❌ Failed to retrieve exchange rates:', ratesData.message);
        }
        
        console.log('\n' + '=' .repeat(80) + '\n');
        
        // Test 4: Test error cases
        console.log('🚫 Test 4: Error Cases');
        console.log('=' .repeat(50));
        
        // Test invalid person ID
        const invalidPersonResponse = await fetch(`${BASE_URL}/portfolio/person/99999`);
        const invalidPersonData = await invalidPersonResponse.json();
        
        console.log('Invalid Person ID Test:');
        console.log('Status:', invalidPersonResponse.status);
        console.log('Message:', invalidPersonData.message);
        
        if (invalidPersonResponse.status === 404) {
            console.log('✅ Correctly handled invalid person ID');
        } else {
            console.log('❌ Unexpected response for invalid person ID');
        }
        
        // Test non-numeric person ID
        const nonNumericResponse = await fetch(`${BASE_URL}/portfolio/person/abc`);
        const nonNumericData = await nonNumericResponse.json();
        
        console.log('\nNon-numeric Person ID Test:');
        console.log('Status:', nonNumericResponse.status);
        console.log('Message:', nonNumericData.message);
        
        if (nonNumericResponse.status === 400) {
            console.log('✅ Correctly handled non-numeric person ID');
        } else {
            console.log('❌ Unexpected response for non-numeric person ID');
        }
        
        console.log('\n🎉 Portfolio API Testing Complete!');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Your server is running on http://localhost:3000');
        console.log('2. You have expense data in your database');
        console.log('3. Database connection is working');
        console.log('4. Install node-fetch: npm install node-fetch');
    }
}

// Helper function to test with sample data creation
async function testPortfolioWithSampleData() {
    console.log('🏗️  First, let\'s check if we have sample data...\n');
    
    try {
        // Check persons
        const personsResponse = await fetch(`${BASE_URL}/persons`);
        const personsData = await personsResponse.json();
        
        console.log(`Found ${personsData.data?.length || 0} persons`);
        
        // Check accounts
        const accountsResponse = await fetch(`${BASE_URL}/accounts`);
        const accountsData = await accountsResponse.json();
        
        console.log(`Found ${accountsData.data?.length || 0} accounts`);
        
        // Check expenses
        const expensesResponse = await fetch(`${BASE_URL}/expenses`);
        const expensesData = await expensesResponse.json();
        
        console.log(`Found ${expensesData.data?.length || 0} expenses`);
        
        if ((personsData.data?.length || 0) === 0) {
            console.log('\n⚠️  No persons found. Portfolio will be empty.');
            console.log('Please create some test data first using other APIs.');
        }
        
        console.log('\nNow testing portfolio API...\n');
        await testPortfolioAPI();
        
    } catch (error) {
        console.error('❌ Error checking sample data:', error.message);
        await testPortfolioAPI();
    }
}

// Run the tests
console.log('🔍 Portfolio API Test Suite');
console.log('Time:', new Date().toISOString());
console.log('=' .repeat(80));

testPortfolioWithSampleData();