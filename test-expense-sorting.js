const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1'; // Adjust port if needed

async function testExpenseSorting() {
    console.log('🔍 Testing Expense Sorting (Currency → TxnDate DESC)');
    console.log('=' .repeat(60));
    console.log('Time:', new Date().toISOString());
    console.log('');

    try {
        console.log('📊 Fetching expenses with new sorting...');
        
        // Get expenses with the new sorting
        const response = await fetch(`${BASE_URL}/expenses?limit=20`);
        const data = await response.json();
        
        console.log('Status Code:', response.status);
        console.log('Response Status:', data.status);
        console.log('');
        
        if (data.status === 'success') {
            console.log('✅ SUCCESS! Expenses retrieved successfully');
            console.log(`Found ${data.data.length} expenses`);
            console.log('');
            
            // Display sorting analysis
            console.log('📋 Expense List (sorted by Currency → TxnDate DESC):');
            console.log('=' .repeat(80));
            console.log('ID  | Currency | Date       | Amount    | Description');
            console.log('-' .repeat(80));
            
            const expenses = data.data;
            expenses.forEach((expense, index) => {
                const id = expense.Id.toString().padEnd(3);
                const currency = (expense.Currency || 'N/A').padEnd(8);
                const date = expense.TxnDate ? expense.TxnDate.substring(0, 10) : 'N/A';
                const amount = expense.Amount.toFixed(2).padStart(9);
                const description = (expense.Description || 'No Description').substring(0, 30);
                
                console.log(`${id} | ${currency} | ${date} | ${amount} | ${description}`);
            });
            
            console.log('-' .repeat(80));
            console.log('');
            
            // Analyze sorting
            console.log('🔍 Sorting Analysis:');
            
            // Group by currency
            const currencyGroups = {};
            expenses.forEach(expense => {
                const currency = expense.Currency || 'N/A';
                if (!currencyGroups[currency]) {
                    currencyGroups[currency] = [];
                }
                currencyGroups[currency].push(expense);
            });
            
            console.log('📈 Currency Distribution:');
            Object.keys(currencyGroups).sort().forEach(currency => {
                const count = currencyGroups[currency].length;
                console.log(`   ${currency}: ${count} expenses`);
                
                // Check if dates are sorted descending within each currency
                const dates = currencyGroups[currency]
                    .map(e => e.TxnDate)
                    .filter(d => d !== null);
                
                if (dates.length > 1) {
                    const isDescending = dates.every((date, index) => {
                        if (index === 0) return true;
                        return new Date(dates[index - 1]) >= new Date(date);
                    });
                    
                    console.log(`   └─ Dates sorted descending: ${isDescending ? '✅ YES' : '❌ NO'}`);
                }
            });
            
            console.log('');
            
            // Test pagination
            console.log('📄 Testing pagination...');
            const page2Response = await fetch(`${BASE_URL}/expenses?page=2&limit=5`);
            const page2Data = await page2Response.json();
            
            if (page2Data.status === 'success') {
                console.log('✅ Pagination works correctly');
                console.log(`Page 2 has ${page2Data.data.length} expenses`);
                
                if (page2Data.data.length > 0) {
                    const firstExpense = page2Data.data[0];
                    console.log(`First expense on page 2: ${firstExpense.Currency || 'N/A'} - ${firstExpense.TxnDate ? firstExpense.TxnDate.substring(0, 10) : 'N/A'}`);
                }
            } else {
                console.log('⚠️  Pagination test failed:', page2Data.message);
            }
            
        } else {
            console.log('❌ ERROR! Failed to retrieve expenses:');
            console.log('Message:', data.message);
            if (data.error) {
                console.log('Error Details:', data.error);
            }
        }
        
    } catch (error) {
        console.error('❌ Network/Connection Error:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Server is not running');
        console.log('2. Wrong port number (check your server config)');
        console.log('3. Database connection issue');
        console.log('4. Make sure to install: npm install node-fetch');
    }
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('🏁 Test Complete');
}

// Helper function to test different sorting scenarios
async function testCustomSorting() {
    console.log('');
    console.log('🎯 Testing Custom Sorting Options...');
    console.log('=' .repeat(60));
    
    const testCases = [
        { params: '?sortBy=Amount&sortOrder=asc', description: 'Amount Ascending' },
        { params: '?sortBy=TxnDate&sortOrder=asc', description: 'Date Ascending' },
        { params: '?sortBy=Description', description: 'Description (default desc)' }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`\n📋 Testing: ${testCase.description}`);
            console.log(`URL: ${BASE_URL}/expenses${testCase.params}&limit=5`);
            
            const response = await fetch(`${BASE_URL}/expenses${testCase.params}&limit=5`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.length > 0) {
                console.log('✅ Success! First few results:');
                data.data.slice(0, 3).forEach((expense, index) => {
                    const currency = expense.Currency || 'N/A';
                    const date = expense.TxnDate ? expense.TxnDate.substring(0, 10) : 'N/A';
                    const amount = expense.Amount.toFixed(2);
                    console.log(`   ${index + 1}. ${currency} | ${date} | ${amount} | ${expense.Description || 'N/A'}`);
                });
            } else {
                console.log('❌ Failed or no data');
            }
            
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }
}

// Run the tests
console.log('🧪 Expense Sorting Test Suite');
console.log('Testing sorting: Currency ASC → TxnDate DESC → Custom Sort');
console.log('');

testExpenseSorting().then(() => {
    return testCustomSorting();
});