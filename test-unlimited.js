const http = require('http');

function testAPI() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3002/api/v1/expenses', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Invalid JSON'));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function main() {
    console.log('🧪 Testing Unlimited Records Feature...\n');
    
    try {
        const result = await testAPI();
        
        if (result.status === 'success') {
            const { data, pagination } = result;
            
            console.log('✅ API Response Success!');
            console.log(`📊 Records returned: ${data.length}`);
            console.log(`📈 Total available: ${pagination.total}`);
            console.log(`⚙️  Limit setting: ${pagination.limit}`);
            console.log(`📄 Pages: ${pagination.pages}`);
            
            if (data.length === pagination.total && pagination.limit === 0) {
                console.log('\n🎉 SUCCESS: Unlimited records feature is working!');
                console.log('✅ All records returned without pagination limit');
            } else if (data.length < pagination.total) {
                console.log('\n❌ ISSUE: Still limited to fewer records');
                console.log(`Missing: ${pagination.total - data.length} records`);
            }
        } else {
            console.log('❌ API Error:', result.message);
            if (result.errors) {
                result.errors.forEach(err => console.log('  -', err));
            }
        }
        
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
        console.log('💡 Make sure server is running: npx ts-node src/server.ts');
    }
}

main();