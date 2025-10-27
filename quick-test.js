const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function quickTest() {
    try {
        console.log('🔍 Quick Test: Transaction Type Filter');
        console.log('=' .repeat(50));
        
        // Test expenses endpoint
        console.log('Testing expenses endpoint...');
        const response = await fetch(`${BASE_URL}/expenses?limit=5`);
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.status === 'success' && data.data) {
            console.log('\n✅ Expenses API working');
            console.log(`Found ${data.data.length} expenses`);
            
            // Check account types
            const types = data.data.map(e => e.AccountType).filter(Boolean);
            const uniqueTypes = [...new Set(types)];
            
            console.log('\nAccount Types in response:', uniqueTypes);
            
            if (uniqueTypes.length === 1 && uniqueTypes[0] === 'Transaction') {
                console.log('✅ SUCCESS: Only Transaction type accounts found!');
            } else if (uniqueTypes.length === 0) {
                console.log('⚠️ No AccountType field in response');
            } else {
                console.log('❌ WARNING: Non-Transaction types found:', uniqueTypes);
            }
        } else {
            console.log('❌ Error:', data.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Server is running (npm run dev)');
        console.log('2. Database is connected');
        console.log('3. Port 3002 is correct');
    }
}

quickTest();