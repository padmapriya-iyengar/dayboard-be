const API_BASE = 'http://localhost:3000/api/v1';

// Test data
let createdPersonId;
let createdAccountId;
let createdExpenseId;

async function testAPI() {
  console.log('🧪 Starting comprehensive Person Account integration tests...\n');

  try {
    // Test 1: Create Person
    console.log('1️⃣ Testing Person Creation');
    const personResponse = await fetch(`${API_BASE}/persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: 'John Doe'
      })
    });
    
    if (personResponse.ok) {
      const personData = await personResponse.json();
      createdPersonId = personData.data.person.Id;
      console.log('✅ Person created successfully:', personData.data.person);
    } else {
      const error = await personResponse.json();
      console.log('❌ Person creation failed:', error);
    }

    // Test 2: Create Account for Person
    console.log('\n2️⃣ Testing Account Creation');
    const accountResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Person_Id: createdPersonId,
        AccountName: 'Primary Checking',
        AccountType: 'Checking',
        IsActive: true
      })
    });

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      createdAccountId = accountData.data.account.Id;
      console.log('✅ Account created successfully:', accountData.data.account);
    } else {
      const error = await accountResponse.json();
      console.log('❌ Account creation failed:', error);
    }

    // Test 3: Create Expense with Account_Id
    console.log('\n3️⃣ Testing Expense Creation with Account_Id');
    const expenseResponse = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Amount: 150.75,
        Description: 'Grocery shopping',
        isDebit: true,
        TxnDate: new Date().toISOString().split('T')[0],
        Account_Id: createdAccountId
      })
    });

    if (expenseResponse.ok) {
      const expenseData = await expenseResponse.json();
      createdExpenseId = expenseData.data.Id;
      console.log('✅ Expense created successfully:', expenseData.data);
    } else {
      const error = await expenseResponse.json();
      console.log('❌ Expense creation failed:', error);
    }

    // Test 4: Get All Expenses (should include account and person info)
    console.log('\n4️⃣ Testing Enhanced Expense Listing');
    const allExpensesResponse = await fetch(`${API_BASE}/expenses`);
    
    if (allExpensesResponse.ok) {
      const expensesData = await allExpensesResponse.json();
      console.log('✅ Expenses retrieved with account info:', expensesData.data.slice(0, 2));
    } else {
      const error = await allExpensesResponse.json();
      console.log('❌ Failed to get expenses:', error);
    }

    // Test 5: Filter Expenses by Account_Id
    console.log('\n5️⃣ Testing Expense Filtering by Account');
    const filteredResponse = await fetch(`${API_BASE}/expenses?Account_Id=${createdAccountId}`);
    
    if (filteredResponse.ok) {
      const filteredData = await filteredResponse.json();
      console.log('✅ Expenses filtered by account:', filteredData.data);
    } else {
      const error = await filteredResponse.json();
      console.log('❌ Failed to filter expenses by account:', error);
    }

    // Test 6: Filter Expenses by Person_Id (through account)
    console.log('\n6️⃣ Testing Expense Filtering by Person');
    const personFilterResponse = await fetch(`${API_BASE}/expenses?Person_Id=${createdPersonId}`);
    
    if (personFilterResponse.ok) {
      const personFilterData = await personFilterResponse.json();
      console.log('✅ Expenses filtered by person:', personFilterData.data);
    } else {
      const error = await personFilterResponse.json();
      console.log('❌ Failed to filter expenses by person:', error);
    }

    // Test 7: Get Accounts for Person
    console.log('\n7️⃣ Testing Account Retrieval by Person');
    const accountsByPersonResponse = await fetch(`${API_BASE}/accounts/person/${createdPersonId}`);
    
    if (accountsByPersonResponse.ok) {
      const accountsByPersonData = await accountsByPersonResponse.json();
      console.log('✅ Accounts for person:', accountsByPersonData.data);
    } else {
      const error = await accountsByPersonResponse.json();
      console.log('❌ Failed to get accounts for person:', error);
    }

    // Test 8: Get Accounts with Expense Counts
    console.log('\n8️⃣ Testing Accounts with Expense Counts');
    const accountsWithCountsResponse = await fetch(`${API_BASE}/accounts/with-expense-counts`);
    
    if (accountsWithCountsResponse.ok) {
      const accountsWithCountsData = await accountsWithCountsResponse.json();
      console.log('✅ Accounts with expense counts:', accountsWithCountsData.data);
    } else {
      const error = await accountsWithCountsResponse.json();
      console.log('❌ Failed to get accounts with counts:', error);
    }

    // Test 9: Update Account
    console.log('\n9️⃣ Testing Account Update');
    const updateAccountResponse = await fetch(`${API_BASE}/accounts/${createdAccountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AccountName: 'Updated Primary Checking',
        AccountType: 'Premium Checking'
      })
    });

    if (updateAccountResponse.ok) {
      const updateAccountData = await updateAccountResponse.json();
      console.log('✅ Account updated successfully:', updateAccountData.data);
    } else {
      const error = await updateAccountResponse.json();
      console.log('❌ Account update failed:', error);
    }

    // Test 10: Update Expense with different Account_Id
    console.log('\n🔟 Testing Expense Update with Account_Id');
    const updateExpenseResponse = await fetch(`${API_BASE}/expenses/${createdExpenseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Amount: 175.50,
        Description: 'Updated grocery shopping'
      })
    });

    if (updateExpenseResponse.ok) {
      const updateExpenseData = await updateExpenseResponse.json();
      console.log('✅ Expense updated successfully:', updateExpenseData.data);
    } else {
      const error = await updateExpenseResponse.json();
      console.log('❌ Expense update failed:', error);
    }

    // Test 11: Create Second Account for Same Person
    console.log('\n1️⃣1️⃣ Testing Multiple Accounts per Person');
    const secondAccountResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Person_Id: createdPersonId,
        AccountName: 'Savings Account',
        AccountType: 'Savings',
        IsActive: true
      })
    });

    if (secondAccountResponse.ok) {
      const secondAccountData = await secondAccountResponse.json();
      console.log('✅ Second account created:', secondAccountData.data.account);
    } else {
      const error = await secondAccountResponse.json();
      console.log('❌ Second account creation failed:', error);
    }

    // Test 12: Test Referential Integrity
    console.log('\n1️⃣2️⃣ Testing Referential Integrity (Delete Account with Expenses)');
    const deleteAccountResponse = await fetch(`${API_BASE}/accounts/${createdAccountId}`, {
      method: 'DELETE'
    });

    if (!deleteAccountResponse.ok) {
      const error = await deleteAccountResponse.json();
      console.log('✅ Correctly prevented account deletion:', error.message);
    } else {
      console.log('❌ Should not have allowed account deletion with expenses');
    }

    // Test 13: Validation Tests
    console.log('\n1️⃣3️⃣ Testing Input Validation');
    
    // Invalid Account creation (missing required fields)
    const invalidAccountResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AccountName: 'Test Account'
        // Missing Person_Id
      })
    });

    if (!invalidAccountResponse.ok) {
      const error = await invalidAccountResponse.json();
      console.log('✅ Correctly rejected invalid account data:', error.message);
    } else {
      console.log('❌ Should have rejected invalid account data');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  try {
    // Delete expense first (referential integrity)
    if (createdExpenseId) {
      const deleteExpenseResponse = await fetch(`${API_BASE}/expenses/${createdExpenseId}`, {
        method: 'DELETE'
      });
      if (deleteExpenseResponse.ok) {
        console.log('✅ Test expense deleted');
      }
    }

    // Then delete account
    if (createdAccountId) {
      const deleteAccountResponse = await fetch(`${API_BASE}/accounts/${createdAccountId}`, {
        method: 'DELETE'
      });
      if (deleteAccountResponse.ok) {
        console.log('✅ Test account deleted');
      }
    }

    // Finally delete person
    if (createdPersonId) {
      const deletePersonResponse = await fetch(`${API_BASE}/persons/${createdPersonId}`, {
        method: 'DELETE'
      });
      if (deletePersonResponse.ok) {
        console.log('✅ Test person deleted');
      }
    }

    console.log('🧹 Cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Run tests
testAPI().finally(() => {
  // Uncomment the next line if you want automatic cleanup
  // cleanup();
});