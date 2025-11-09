// Test script for PersonAccount APIs with Balance and Last_Updated_On columns
const http = require('node:http');

const BASE_URL = 'http://localhost:3002/api/v1/accounts';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method !== 'GET') {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        statusCode: res.statusCode,
                        data: JSON.parse(responseData)
                    };
                    resolve(result);
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

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testBalanceAndLastUpdatedFields() {
    console.log('🧪 Testing Balance and Last_Updated_On Fields in PersonAccount APIs\n');
    
    try {
        // Test 1: Get all accounts (should include new fields)
        console.log('1️⃣ Testing GET all accounts...');
        const getAllResult = await makeRequest('GET', '?limit=3');
        
        if (getAllResult.statusCode === 200 && getAllResult.data.status === 'success') {
            const firstAccount = getAllResult.data.data.accounts[0];
            if (firstAccount && 'Balance' in firstAccount && 'Last_Updated_On' in firstAccount) {
                console.log('✅ GET all: Balance and Last_Updated_On fields present');
                console.log(`   Sample Balance: ${firstAccount.Balance}`);
                console.log(`   Sample Last_Updated_On: ${firstAccount.Last_Updated_On}`);
            } else {
                console.log('❌ GET all: Balance or Last_Updated_On fields missing');
                console.log('   Available fields:', Object.keys(firstAccount || {}));
            }
        } else {
            console.log('❌ GET all failed:', getAllResult.data.message);
        }

        // Test 2: Create account with Balance field
        console.log('\n2️⃣ Testing CREATE account with Balance field...');
        const newAccount = {
            Person_Id: 1, // Assuming person ID 1 exists
            Account: 'Test Account with Balance',
            Currency: 'USD',
            Type: 'Savings',
            Balance: 1500.75
        };
        
        const createResult = await makeRequest('POST', '', newAccount);
        
        if (createResult.statusCode === 201 && createResult.data.status === 'success') {
            const createdAccount = createResult.data.data;
            if ('Balance' in createdAccount && 'Last_Updated_On' in createdAccount) {
                console.log('✅ CREATE: Balance and Last_Updated_On fields present');
                console.log(`   Created Balance: ${createdAccount.Balance}`);
                console.log(`   Created Last_Updated_On: ${createdAccount.Last_Updated_On}`);
                
                // Test 3: Update the Balance field
                console.log('\n3️⃣ Testing UPDATE account Balance field...');
                const updateData = { Balance: 2000.50 };
                const updateResult = await makeRequest('PUT', `/${createdAccount.Id}`, updateData);
                
                if (updateResult.statusCode === 200 && updateResult.data.status === 'success') {
                    const updatedAccount = updateResult.data.data;
                    if (updatedAccount.Balance === 2000.50) {
                        console.log('✅ UPDATE: Balance field updated successfully');
                        console.log(`   Updated Balance: ${updatedAccount.Balance}`);
                        console.log(`   Updated Last_Updated_On: ${updatedAccount.Last_Updated_On}`);
                        
                        // Verify Last_Updated_On was automatically updated
                        const originalTime = new Date(createdAccount.Last_Updated_On);
                        const updatedTime = new Date(updatedAccount.Last_Updated_On);
                        
                        if (updatedTime > originalTime) {
                            console.log('✅ Last_Updated_On automatically updated during balance change');
                        } else {
                            console.log('❌ Last_Updated_On was not updated automatically');
                        }
                    } else {
                        console.log('❌ UPDATE: Balance field not updated correctly');
                        console.log(`   Expected: 2000.50, Got: ${updatedAccount.Balance}`);
                    }
                } else {
                    console.log('❌ UPDATE failed:', updateResult.data.message);
                }
                
                // Test 4: Get single account by ID
                console.log('\n4️⃣ Testing GET account by ID...');
                const getByIdResult = await makeRequest('GET', `/${createdAccount.Id}`);
                
                if (getByIdResult.statusCode === 200 && getByIdResult.data.status === 'success') {
                    const fetchedAccount = getByIdResult.data.data;
                    if ('Balance' in fetchedAccount && 'Last_Updated_On' in fetchedAccount) {
                        console.log('✅ GET by ID: Balance and Last_Updated_On fields present');
                        console.log(`   Fetched Balance: ${fetchedAccount.Balance}`);
                        console.log(`   Fetched Last_Updated_On: ${fetchedAccount.Last_Updated_On}`);
                    } else {
                        console.log('❌ GET by ID: Balance or Last_Updated_On fields missing');
                    }
                } else {
                    console.log('❌ GET by ID failed:', getByIdResult.data.message);
                }
                
                // Test 5: Create account without Balance (should default to 0)
                console.log('\n5️⃣ Testing CREATE account without Balance (default behavior)...');
                const defaultAccount = {
                    Person_Id: 1,
                    Account: 'Test Account Default Balance',
                    Currency: 'EUR',
                    Type: 'Checking'
                };
                
                const defaultResult = await makeRequest('POST', '', defaultAccount);
                
                if (defaultResult.statusCode === 201 && defaultResult.data.status === 'success') {
                    const defaultCreatedAccount = defaultResult.data.data;
                    if (defaultCreatedAccount.Balance === 0) {
                        console.log('✅ CREATE without Balance: Defaults to 0');
                        console.log(`   Default Balance: ${defaultCreatedAccount.Balance}`);
                    } else {
                        console.log('❌ CREATE without Balance: Did not default to 0');
                        console.log(`   Got Balance: ${defaultCreatedAccount.Balance}`);
                    }
                } else {
                    console.log('❌ CREATE without Balance failed:', defaultResult.data.message);
                }
                
            } else {
                console.log('❌ CREATE: Balance or Last_Updated_On fields missing in response');
                console.log('   Available fields:', Object.keys(createdAccount || {}));
            }
        } else {
            console.log('❌ CREATE failed:', createResult.data.message || 'Unknown error');
        }

        console.log('\n🎯 Balance and Last_Updated_On Integration Test Summary:');
        console.log('   - All CRUD operations should now support Balance and Last_Updated_On fields');
        console.log('   - Balance field defaults to 0 when creating accounts');
        console.log('   - Last_Updated_On is automatically set during creation and updates');
        console.log('   - Balance field can be updated independently');
        console.log('   - All SELECT queries include Balance and Last_Updated_On fields');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. Server is running on port 3002');
        console.log('   2. Database has Person_Account table with Balance and Last_Updated_On columns');
        console.log('   3. At least one Person_Details record exists for testing');
    }
}

testBalanceAndLastUpdatedFields();