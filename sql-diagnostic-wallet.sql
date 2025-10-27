-- SQL Diagnostic Queries for Wallet Inquiries Issue
-- Run these queries directly in your SQL Server Management Studio or database tool

-- 1. Check all accounts and their types
SELECT 
    pa.Id as AccountId,
    pa.Account as AccountName,
    pa.Type as AccountType,
    pa.Currency,
    p.Name as PersonName
FROM Person_Account pa
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
ORDER BY p.Name, pa.Type;

-- 2. Count accounts by type and person
SELECT 
    p.Name as PersonName,
    pa.Type as AccountType,
    COUNT(*) as AccountCount
FROM Person_Account pa
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
GROUP BY p.Name, pa.Type
ORDER BY p.Name, pa.Type;

-- 3. Check specifically for WALLET type accounts
SELECT 
    pa.Id as AccountId,
    pa.Account as AccountName,
    pa.Type as AccountType,
    p.Name as PersonName
FROM Person_Account pa
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
WHERE pa.Type = 'WALLET'
ORDER BY p.Name;

-- 4. Check expenses in WALLET accounts
SELECT 
    e.Id as ExpenseId,
    e.Amount,
    e.Description,
    e.TxnDate,
    pa.Account as AccountName,
    pa.Type as AccountType,
    p.Name as PersonName
FROM Expense_Details e
LEFT JOIN Person_Account pa ON e.Account_Id = pa.Id
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
WHERE pa.Type = 'WALLET'
ORDER BY p.Name, e.TxnDate DESC;

-- 5. Count expenses by account type and person
SELECT 
    p.Name as PersonName,
    pa.Type as AccountType,
    COUNT(*) as ExpenseCount,
    SUM(e.Amount) as TotalAmount
FROM Expense_Details e
LEFT JOIN Person_Account pa ON e.Account_Id = pa.Id
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
GROUP BY p.Name, pa.Type
ORDER BY p.Name, pa.Type;

-- 6. Check if accounts have NULL or empty Type values
SELECT 
    pa.Id as AccountId,
    pa.Account as AccountName,
    pa.Type as AccountType,
    CASE 
        WHEN pa.Type IS NULL THEN 'NULL'
        WHEN pa.Type = '' THEN 'EMPTY'
        ELSE 'HAS_VALUE'
    END as TypeStatus,
    p.Name as PersonName
FROM Person_Account pa
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
WHERE pa.Type IS NULL OR pa.Type = '' OR pa.Type = 'WALLET'
ORDER BY TypeStatus, p.Name;

-- 7. Simulate the exact wallet inquiries query
SELECT 
    e.Id, 
    e.Amount, 
    e.Description, 
    e.isDebit, 
    e.TxnDate, 
    e.Account_Id,
    ISNULL(pa.Account, 'No Account') as AccountName,
    ISNULL(pa.Currency, '') as Currency,
    ISNULL(pa.Type, '') as AccountType,
    ISNULL(p.Name, 'Unknown Person') as PersonName
FROM Expense_Details e
LEFT JOIN Person_Account pa ON e.Account_Id = pa.Id
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
WHERE pa.Type = 'WALLET'
ORDER BY e.TxnDate DESC;

-- 8. Check for data inconsistencies
SELECT 'Data Check Results' as CheckType,
    (SELECT COUNT(*) FROM Person_Details) as TotalPersons,
    (SELECT COUNT(*) FROM Person_Account) as TotalAccounts,
    (SELECT COUNT(*) FROM Person_Account WHERE Type = 'WALLET') as WalletAccounts,
    (SELECT COUNT(*) FROM Person_Account WHERE Type = 'Transaction') as TransactionAccounts,
    (SELECT COUNT(*) FROM Expense_Details) as TotalExpenses,
    (SELECT COUNT(*) 
     FROM Expense_Details e 
     LEFT JOIN Person_Account pa ON e.Account_Id = pa.Id 
     WHERE pa.Type = 'WALLET') as ExpensesInWalletAccounts;

-- 9. Find accounts without Type or with unexpected Type values
SELECT 
    pa.Type as AccountType,
    COUNT(*) as Count
FROM Person_Account pa
GROUP BY pa.Type
ORDER BY COUNT(*) DESC;