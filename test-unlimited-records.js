const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testUnlimitedRecords() {
    console.log('🔍 Testing Unlimited Records Feature');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Get expenses without limit parameter (should return all)
        console.log('📋 Test 1: Expenses without limit (all records)');
        console.log('-' .repeat(50));
        
        const unlimitedResponse = await fetch(`${BASE_URL}/expenses`);
        const unlimitedData = await unlimitedResponse.json();
        
        if (unlimitedData.status === 'success') {
            console.log('✅ Unlimited expenses request successful');
            console.log(`Records returned: ${unlimitedData.data.length}`);
            console.log(`Total available: ${unlimitedData.pagination?.total || 'N/A'}`);
            
            if (unlimitedData.data.length === unlimitedData.pagination?.total) {
                console.log('✅ SUCCESS: All records returned without limit');
            } else {
                console.log('⚠️ May still have pagination applied');
            }
        } else {
            console.log('❌ Failed:', unlimitedData.message);
        }
        
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Test 2: Compare with limited results
        console.log('📋 Test 2: Compare with limited results (limit=5)');
        console.log('-' .repeat(50));
        
        const limitedResponse = await fetch(`${BASE_URL}/expenses?limit=5`);
        const limitedData = await limitedResponse.json();
        
        if (limitedData.status === 'success') {
            console.log('✅ Limited expenses request successful');
            console.log(`Records returned: ${limitedData.data.length}`);
            console.log(`Should be limited to: 5`);
            
            if (limitedData.data.length <= 5) {
                console.log('✅ Limit parameter working correctly');
            } else {
                console.log('❌ Limit parameter not working');
            }
        }
        
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Test 3: Test wallet inquiries without limit
        console.log('🎯 Test 3: Wallet inquiries without limit');
        console.log('-' .repeat(50));
        
        const walletUnlimitedResponse = await fetch(`${BASE_URL}/expenses/wallet-inquiries`);
        const walletUnlimitedData = await walletUnlimitedResponse.json();
        
        if (walletUnlimitedData.status === 'success') {
            console.log('✅ Unlimited wallet inquiries successful');
            console.log(`Records returned: ${walletUnlimitedData.data.length}`);
            console.log(`Total available: ${walletUnlimitedData.pagination?.total || 'N/A'}`);
            
            if (walletUnlimitedData.data.length === walletUnlimitedData.pagination?.total) {
                console.log('✅ SUCCESS: All wallet records returned without limit');
            } else {
                console.log('⚠️ May still have pagination applied for wallet inquiries');
            }
        } else {
            console.log('❌ Failed:', walletUnlimitedData.message);
        }
        
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Test 4: Test wallet inquiries with limit
        console.log('🎯 Test 4: Wallet inquiries with limit=3');
        console.log('-' .repeat(50));
        
        const walletLimitedResponse = await fetch(`${BASE_URL}/expenses/wallet-inquiries?limit=3`);
        const walletLimitedData = await walletLimitedResponse.json();
        
        if (walletLimitedData.status === 'success') {
            console.log('✅ Limited wallet inquiries successful');
            console.log(`Records returned: ${walletLimitedData.data.length}`);
            console.log(`Should be limited to: 3`);
            
            if (walletLimitedData.data.length <= 3) {
                console.log('✅ Wallet limit parameter working correctly');
            } else {
                console.log('❌ Wallet limit parameter not working');
            }
        }
        
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Test 5: Test with limit=0 (explicit unlimited)
        console.log('📋 Test 5: Explicit unlimited with limit=0');
        console.log('-' .repeat(50));
        
        const explicitUnlimitedResponse = await fetch(`${BASE_URL}/expenses?limit=0`);
        const explicitUnlimitedData = await explicitUnlimitedResponse.json();
        
        if (explicitUnlimitedData.status === 'success') {
            console.log('✅ Explicit unlimited (limit=0) successful');
            console.log(`Records returned: ${explicitUnlimitedData.data.length}`);
            
            // Compare with no-limit request
            if (unlimitedData.status === 'success' && 
                explicitUnlimitedData.data.length === unlimitedData.data.length) {
                console.log('✅ limit=0 and no-limit return same results');
            } else {
                console.log('⚠️ limit=0 and no-limit results differ');
            }
        }
        
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Summary
        console.log('📊 Test Summary');
        console.log('-' .repeat(50));
        
        if (unlimitedData.status === 'success' && limitedData.status === 'success') {
            console.log(`No limit: ${unlimitedData.data.length} records`);
            console.log(`With limit=5: ${limitedData.data.length} records`);
            
            if (unlimitedData.data.length > limitedData.data.length) {
                console.log('✅ SUCCESS: Unlimited feature working correctly');
                console.log('  - No limit returns more records than limited');
                console.log('  - Limit parameter still works when specified');
            } else {
                console.log('⚠️ Results inconclusive or issue present');
            }
        }
        
        if (walletUnlimitedData.status === 'success' && walletLimitedData.status === 'success') {
            console.log(`Wallet no limit: ${walletUnlimitedData.data.length} records`);
            console.log(`Wallet limit=3: ${walletLimitedData.data.length} records`);
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Server is running (npm run dev)');
        console.log('2. Database is connected');
        console.log('3. Port 3002 is correct');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Unlimited Records Test Complete');
    console.log('');
    console.log('📝 How to use:');
    console.log('- GET /api/v1/expenses → All records (no limit)');
    console.log('- GET /api/v1/expenses?limit=10 → Limited to 10 records');
    console.log('- GET /api/v1/expenses?limit=0 → All records (explicit)');
    console.log('- Same applies to /api/v1/expenses/wallet-inquiries');
}

console.log('🧪 Testing Unlimited Records Feature');
console.log('Verifying that expense APIs can return all records without limits');
console.log('');

testUnlimitedRecords();