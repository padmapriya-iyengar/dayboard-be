const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3002/api/v1';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function debugExpenseLimit() {
    console.log('🔍 Debug: Expense API Limit Issue');
    console.log('=' .repeat(50));
    
    try {
        // Test without any parameters
        console.log('1. Testing expenses without any parameters...');
        const data1 = await makeRequest(`${BASE_URL}/expenses`);
        
        if (data1.status === 'success') {
            console.log(`   Records returned: ${data1.data.length}`);
            console.log(`   Pagination limit: ${data1.pagination?.limit}`);
            console.log(`   Total available: ${data1.pagination?.total}`);
            
            if (data1.data.length < data1.pagination?.total) {
                console.log('   ❌ ISSUE: Not all records returned');
                console.log(`   Missing: ${data1.pagination.total - data1.data.length} records`);
            } else {
                console.log('   ✅ All records returned');
            }
        } else {
            console.log('   ❌ API call failed:', data1.message);
        }
        
        // Test with limit=0
        console.log('\n2. Testing expenses with limit=0...');
        const data2 = await makeRequest(`${BASE_URL}/expenses?limit=0`);
        
        if (data2.status === 'success') {
            console.log(`   Records returned: ${data2.data.length}`);
            console.log(`   Pagination limit: ${data2.pagination?.limit}`);
            console.log(`   Total available: ${data2.pagination?.total}`);
            
            if (data2.data.length === data1.data.length) {
                console.log('   ⚠️ Same result as no-limit request');
            }
        }
        
        // Test with limit=10
        console.log('\n3. Testing expenses with limit=10...');
        const data3 = await makeRequest(`${BASE_URL}/expenses?limit=10`);
        
        if (data3.status === 'success') {
            console.log(`   Records returned: ${data3.data.length}`);
            console.log(`   Pagination limit: ${data3.pagination?.limit}`);
            console.log(`   Should be max 10: ${data3.data.length <= 10 ? 'YES' : 'NO'}`);
        }
        
        // Check if it's exactly 50 records
        console.log('\n4. Analysis:');
        if (data1.status === 'success') {
            if (data1.data.length === 50 && data1.pagination?.total > 50) {
                console.log('   ❌ CONFIRMED: Server is still applying 50 record limit');
                console.log('   📋 Troubleshooting steps:');
                console.log('     1. Restart the server (npm run dev)');
                console.log('     2. Check if TypeScript compiled correctly');
                console.log('     3. Verify the correct code branch is running');
                console.log('     4. Check server console for compilation errors');
            } else if (data1.data.length === data1.pagination?.total) {
                console.log('   ✅ SUCCESS: Unlimited records working correctly');
            } else {
                console.log('   ⚠️ Unexpected behavior - investigate further');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure server is running: npm run dev');
    }
}

debugExpenseLimit();