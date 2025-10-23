// Test script for Person and enhanced Expense APIs
// Run with: node test-person-api.js

const API_BASE = "http://localhost:3001/api/v1";

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`\n=== ${options.method || 'GET'} ${url} ===`);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { error };
  }
}

async function testPersonAPI() {
  console.log('\n🧑‍💼 TESTING PERSON API 🧑‍💼');
  
  // Test 1: Create persons
  console.log('\n📝 Creating test persons...');
  
  const person1 = await makeRequest('/persons', {
    method: 'POST',
    body: JSON.stringify({
      Name: 'John Doe'
    })
  });
  
  const person2 = await makeRequest('/persons', {
    method: 'POST',
    body: JSON.stringify({
      Name: 'Jane Smith'
    })
  });
  
  const person3 = await makeRequest('/persons', {
    method: 'POST',
    body: JSON.stringify({
      Name: 'Bob Johnson'
    })
  });
  
  // Test 2: Get all persons
  console.log('\n📋 Getting all persons...');
  await makeRequest('/persons');
  
  // Test 3: Get person by ID (assuming ID = 1 exists)
  if (person1.data && person1.data.data && person1.data.data.person) {
    const personId = person1.data.data.person.Id;
    console.log(`\n👤 Getting person by ID (${personId})...`);
    await makeRequest(`/persons/${personId}`);
  }
  
  // Test 4: Update person (assuming ID = 1 exists)
  if (person1.data && person1.data.data && person1.data.data.person) {
    const personId = person1.data.data.person.Id;
    console.log(`\n✏️ Updating person ${personId}...`);
    await makeRequest(`/persons/${personId}`, {
      method: 'PUT',
      body: JSON.stringify({
        Name: 'John Doe Updated'
      })
    });
  }
  
  // Test 5: Get persons with expense counts
  console.log('\n📊 Getting persons with expense counts...');
  await makeRequest('/persons/with-expense-counts');
  
  return { person1, person2, person3 };
}

async function testExpenseAPIWithPersons(persons) {
  console.log('\n💰 TESTING ENHANCED EXPENSE API WITH PERSONS 💰');
  
  const person1Id = persons.person1.data?.data?.person?.Id;
  const person2Id = persons.person2.data?.data?.person?.Id;
  
  // Test 1: Create expenses with Person_Id
  console.log('\n📝 Creating expenses with Person_Id...');
  
  const expense1 = await makeRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      Amount: 150.75,
      Description: 'Groceries from Walmart',
      isDebit: true,
      TxnDate: '2024-01-15',
      Person_Id: person1Id
    })
  });
  
  const expense2 = await makeRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      Amount: 2500.00,
      Description: 'Salary Credit',
      isDebit: false,
      TxnDate: '2024-01-31',
      Person_Id: person2Id
    })
  });
  
  const expense3 = await makeRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      Amount: 89.99,
      Description: 'Gas Station',
      isDebit: true,
      TxnDate: '2024-01-20',
      Person_Id: person1Id
    })
  });
  
  // Test 2: Get all expenses (should now include Person_Id and PersonName)
  console.log('\n📋 Getting all expenses with person details...');
  await makeRequest('/expenses');
  
  // Test 3: Filter expenses by Person_Id
  if (person1Id) {
    console.log(`\n🔍 Filtering expenses by Person_Id (${person1Id})...`);
    await makeRequest(`/expenses?Person_Id=${person1Id}`);
  }
  
  // Test 4: Get expense by ID (should include person details)
  if (expense1.data && expense1.data.data) {
    const expenseId = expense1.data.data.Id;
    console.log(`\n👁️ Getting expense by ID (${expenseId}) with person details...`);
    await makeRequest(`/expenses/${expenseId}`);
  }
  
  // Test 5: Update expense with different Person_Id
  if (expense1.data && expense1.data.data && person2Id) {
    const expenseId = expense1.data.data.Id;
    console.log(`\n✏️ Updating expense ${expenseId} with different Person_Id...`);
    await makeRequest(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify({
        Amount: 160.50,
        Description: 'Updated Groceries',
        Person_Id: person2Id
      })
    });
  }
  
  // Test 6: Get expense statistics (should work with Person_Id filter)
  console.log('\n📊 Getting expense statistics...');
  await makeRequest('/expenses/stats');
  
  if (person1Id) {
    console.log(`\n📊 Getting expense statistics for Person_Id ${person1Id}...`);
    await makeRequest(`/expenses/stats?Person_Id=${person1Id}`);
  }
  
  // Test 7: Get expense summary with date filtering
  console.log('\n📈 Getting expense summary...');
  await makeRequest('/expenses/summary?dateFrom=2024-01-01&dateTo=2024-01-31');
  
  // Test 8: Sort by Person_Id
  console.log('\n🔄 Sorting expenses by Person_Id...');
  await makeRequest('/expenses?sortBy=Person_Id&sortOrder=asc');
  
  return { expense1, expense2, expense3 };
}

async function testErrorCases(persons) {
  console.log('\n❌ TESTING ERROR CASES ❌');
  
  // Test 1: Invalid Person_Id in expense creation
  console.log('\n❌ Creating expense with invalid Person_Id...');
  await makeRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      Amount: 100.00,
      Description: 'Test expense',
      isDebit: true,
      Person_Id: 99999 // Non-existent Person_Id
    })
  });
  
  // Test 2: Delete person with associated expenses
  const person1Id = persons.person1.data?.data?.person?.Id;
  if (person1Id) {
    console.log(`\n❌ Trying to delete person ${person1Id} with associated expenses...`);
    await makeRequest(`/persons/${person1Id}`, {
      method: 'DELETE'
    });
  }
  
  // Test 3: Invalid validation tests
  console.log('\n❌ Testing validation errors...');
  
  // Invalid person name
  await makeRequest('/persons', {
    method: 'POST',
    body: JSON.stringify({
      Name: '' // Empty name
    })
  });
  
  // Invalid Person_Id type
  await makeRequest('/expenses?Person_Id=invalid');
  
  // Invalid person ID in path
  await makeRequest('/persons/invalid', {
    method: 'GET'
  });
}

async function testDataIntegrity() {
  console.log('\n🔍 TESTING DATA INTEGRITY 🔍');
  
  // Test 1: Verify person-expense relationships
  console.log('\n🔗 Verifying person-expense relationships...');
  
  const persons = await makeRequest('/persons/with-expense-counts');
  if (persons.data && persons.data.data && persons.data.data.persons) {
    console.log('\nPersons with their expense counts:');
    persons.data.data.persons.forEach(person => {
      console.log(`- ${person.Name} (ID: ${person.Id}): ${person.expenseCount} expenses`);
    });
  }
  
  // Test 2: Cross-verify expense data
  console.log('\n🔄 Cross-verifying expense data with person details...');
  const expenses = await makeRequest('/expenses');
  if (expenses.data && expenses.data.data) {
    console.log('\nExpenses with person information:');
    expenses.data.data.forEach(expense => {
      console.log(`- $${expense.Amount} by ${expense.PersonName || 'Unknown'} (Person_Id: ${expense.Person_Id || 'NULL'})`);
    });
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive Person and Expense API tests...\n');
  
  try {
    // Test Person API
    const persons = await testPersonAPI();
    
    // Test enhanced Expense API
    const expenses = await testExpenseAPIWithPersons(persons);
    
    // Test error cases
    await testErrorCases(persons);
    
    // Test data integrity
    await testDataIntegrity();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('- Person CRUD operations');
    console.log('- Enhanced Expense operations with Person_Id');
    console.log('- Person-Expense relationship validation');
    console.log('- Error handling and validation');
    console.log('- Data integrity verification');
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
  }
}

// Run tests
runAllTests();