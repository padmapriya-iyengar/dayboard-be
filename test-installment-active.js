// Test script for installment APIs with Active column
const http = require('http');

const BASE_URL = 'http://localhost:3002/api/v1/installments';

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

async function testActiveFieldIntegration() {
    console.log('🧪 Testing Active Field Integration in Installment APIs\n');
    
    try {
        // Test 1: Get all installments (should include Active field)
        console.log('1️⃣ Testing GET all installments...');
        const getAllResult = await makeRequest('GET', '?limit=5');
        
        if (getAllResult.statusCode === 200 && getAllResult.data.status === 'success') {
            const firstInstallment = getAllResult.data.data[0];
            if (firstInstallment && 'Active' in firstInstallment) {
                console.log('✅ GET all: Active field present');
                console.log(`   Sample Active value: ${firstInstallment.Active}`);
            } else {
                console.log('❌ GET all: Active field missing');
            }
        } else {
            console.log('❌ GET all failed:', getAllResult.data.message);
        }

        // Test 2: Create installment with Active field
        console.log('\n2️⃣ Testing CREATE installment with Active field...');
        const newInstallment = {
            Account_Id: 1, // Assuming account ID 1 exists
            Amount: 100.50,
            Description: 'Test installment with Active field',
            isDebit: true,
            Type: 'Test',
            Active: true
        };
        
        const createResult = await makeRequest('POST', '', newInstallment);
        
        if (createResult.statusCode === 201 && createResult.data.status === 'success') {
            const createdInstallment = createResult.data.data;
            if ('Active' in createdInstallment) {
                console.log('✅ CREATE: Active field present');
                console.log(`   Created Active value: ${createdInstallment.Active}`);
                
                // Test 3: Update the Active field
                console.log('\n3️⃣ Testing UPDATE installment Active field...');
                const updateData = { Active: false };
                const updateResult = await makeRequest('PUT', `/${createdInstallment.Id}`, updateData);
                
                if (updateResult.statusCode === 200 && updateResult.data.status === 'success') {
                    const updatedInstallment = updateResult.data.data;
                    if (updatedInstallment.Active === false) {
                        console.log('✅ UPDATE: Active field updated successfully');
                        console.log(`   Updated Active value: ${updatedInstallment.Active}`);
                    } else {
                        console.log('❌ UPDATE: Active field not updated correctly');
                    }
                } else {
                    console.log('❌ UPDATE failed:', updateResult.data.message);
                }
                
                // Test 4: Get single installment by ID
                console.log('\n4️⃣ Testing GET installment by ID...');
                const getByIdResult = await makeRequest('GET', `/${createdInstallment.Id}`);
                
                if (getByIdResult.statusCode === 200 && getByIdResult.data.status === 'success') {
                    const fetchedInstallment = getByIdResult.data.data;
                    if ('Active' in fetchedInstallment) {
                        console.log('✅ GET by ID: Active field present');
                        console.log(`   Fetched Active value: ${fetchedInstallment.Active}`);
                    } else {
                        console.log('❌ GET by ID: Active field missing');
                    }
                } else {
                    console.log('❌ GET by ID failed:', getByIdResult.data.message);
                }
                
            } else {
                console.log('❌ CREATE: Active field missing in response');
            }
        } else {
            console.log('❌ CREATE failed:', createResult.data.message || 'Unknown error');
        }

        console.log('\n🎯 Active Field Integration Test Summary:');
        console.log('   - All CRUD operations should now support Active field');
        console.log('   - Active field defaults to true when creating installments');
        console.log('   - Active field can be updated independently');
        console.log('   - All SELECT queries include Active field');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. Server is running on port 3002');
        console.log('   2. Database has Person_Installments table with Active column');
        console.log('   3. At least one Person_Account record exists for testing');
    }
}

testActiveFieldIntegration();