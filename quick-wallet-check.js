const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function quickWalletCheck() {
    console.log('🔍 Quick Wallet Inquiries Check');
    console.log('=' .repeat(50));
    
    try {
        // Check accounts with WALLET type
        console.log('1. Checking WALLET type accounts...');
        const accountsRes = await fetch(`${BASE_URL}/accounts?limit=100`);
        const accountsData = await accountsRes.json();
        
        if (accountsData.status === 'success') {
            const walletAccounts = accountsData.data.filter(a => a.Type === 'WALLET');
            console.log(`   Found ${walletAccounts.length} WALLET accounts`);
            
            const walletOwners = [...new Set(walletAccounts.map(a => a.PersonName))];
            console.log(`   Owned by: ${walletOwners.join(', ')}`);
            
            if (walletOwners.length === 1) {
                console.log('   ❌ ISSUE: Only one person has WALLET accounts');
            }
        }
        
        // Check wallet inquiries
        console.log('\n2. Checking wallet inquiries...');
        const walletRes = await fetch(`${BASE_URL}/expenses/wallet-inquiries?limit=50`);
        const walletData = await walletRes.json();
        
        if (walletData.status === 'success') {
            console.log(`   Found ${walletData.data.length} wallet inquiries`);
            
            const inquiryOwners = [...new Set(walletData.data.map(w => w.PersonName))];
            console.log(`   From persons: ${inquiryOwners.join(', ')}`);
            
            if (inquiryOwners.length === 1) {
                console.log('   ❌ CONFIRMED: Only one person in wallet inquiries');
                console.log(`   Person: ${inquiryOwners[0]}`);
            } else {
                console.log('   ✅ Multiple persons found');
            }
        }
        
        // Check if problem is data or query
        console.log('\n3. Checking all persons...');
        const personsRes = await fetch(`${BASE_URL}/persons`);
        const personsData = await personsRes.json();
        
        if (personsData.status === 'success') {
            console.log(`   Total persons in system: ${personsData.data.length}`);
            console.log(`   Persons: ${personsData.data.map(p => p.Name).join(', ')}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('💡 Quick Diagnosis:');
    console.log('- If only one person has WALLET accounts → Need to create WALLET accounts for others');
    console.log('- If multiple people have WALLET accounts but no expenses → Need to add expenses');
    console.log('- If query issue → Check JOIN conditions and Type filtering');
}

quickWalletCheck();