const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testRateLimitFix() {
    console.log('🔍 Testing Rate Limit Fix for Wallet Inquiries');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Check if wallet inquiries endpoint is accessible
        console.log('📋 Test 1: Basic Wallet Inquiries Request');
        console.log('-' .repeat(40));
        
        const response = await fetch(`${BASE_URL}/expenses/wallet-inquiries?limit=5`);
        
        console.log('Status Code:', response.status);
        console.log('Status Text:', response.statusText);
        
        if (response.status === 429) {
            console.log('❌ Still getting 429 - Rate limit still active');
            console.log('💡 Possible solutions:');
            console.log('1. Make sure NODE_ENV=development in your .env file');
            console.log('2. Restart the server after changes');
            console.log('3. Wait 15 minutes for rate limit to reset');
            console.log('4. Clear browser cache/cookies');
            return;
        }
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Rate limit bypassed!');
            
            const data = await response.json();
            console.log('Response Status:', data.status);
            console.log('Message:', data.message);
            
            if (data.status === 'success') {
                console.log(`Found ${data.data?.length || 0} wallet transactions`);
                console.log(`Total available: ${data.pagination?.total || 0}`);
                
                // Show sample data if available
                if (data.data && data.data.length > 0) {
                    console.log('\nSample Wallet Transaction:');
                    const sample = data.data[0];
                    console.log(`- ID: ${sample.Id}`);
                    console.log(`- Amount: ${sample.Amount}`);
                    console.log(`- Account: ${sample.AccountName}`);
                    console.log(`- Type: ${sample.AccountType}`);
                    console.log(`- Date: ${sample.TxnDate?.substring(0, 10)}`);
                }
            }
        } else {
            console.log(`❌ Unexpected status: ${response.status}`);
            const text = await response.text();
            console.log('Response:', text);
        }
        
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Test 2: Multiple rapid requests to ensure rate limit is bypassed
        console.log('🚀 Test 2: Multiple Rapid Requests (Rate Limit Test)');
        console.log('-' .repeat(40));
        
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(
                fetch(`${BASE_URL}/expenses/wallet-inquiries?page=${i + 1}&limit=1`)
                    .then(res => ({ attempt: i + 1, status: res.status, ok: res.ok }))
                    .catch(err => ({ attempt: i + 1, status: 'ERROR', error: err.message }))
            );
        }
        
        const results = await Promise.all(promises);
        
        console.log('Multiple Request Results:');
        results.forEach(result => {
            const status = result.status === 200 ? '✅' : '❌';
            console.log(`${status} Attempt ${result.attempt}: ${result.status}`);
        });
        
        const successCount = results.filter(r => r.status === 200).length;
        const rateLimitCount = results.filter(r => r.status === 429).length;
        
        console.log(`\nSummary: ${successCount}/5 successful, ${rateLimitCount}/5 rate limited`);
        
        if (rateLimitCount === 0) {
            console.log('✅ Rate limiting successfully bypassed in development!');
        } else {
            console.log('❌ Rate limiting still active');
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure server is running: npm run dev');
        console.log('2. Check server port (should be 3002)');
        console.log('3. Verify database connection');
        console.log('4. Check NODE_ENV environment variable');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Rate Limit Fix Test Complete');
    console.log('\n📝 Quick Fix Summary:');
    console.log('- Modified rate limiter to skip in development mode');
    console.log('- Rate limiting bypassed when NODE_ENV=development');
    console.log('- Wallet inquiries endpoint should now be accessible');
    console.log('- Rate limiting still active in production for security');
}

console.log('🧪 Rate Limit Fix Test');
console.log('Verifying that wallet inquiries endpoint is accessible');
console.log('');

testRateLimitFix();