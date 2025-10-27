# Wallet Inquiries Endpoint

## Overview

A new inquiry endpoint has been added to the expense service that extracts expenses from accounts with Type = 'WALLET', similar to the existing expenses API but filtered specifically for wallet-type accounts.

## New Endpoint

### GET /api/v1/expenses/wallet-inquiries

**Description**: Retrieves all expenses from accounts with Type = 'WALLET' with optional filtering and pagination.

**Query Parameters**: Same as the regular expenses endpoint

- `isDebit` (boolean): Filter by debit/credit transactions
- `dateFrom` (date): Start date filter
- `dateTo` (date): End date filter
- `amountMin` (number): Minimum amount filter
- `amountMax` (number): Maximum amount filter
- `search` (string): Search in description
- `Account_Id` (number): Filter by specific account ID
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 50)
- `sortBy` (string): Sort field (Id, Amount, Description, TxnDate, Account_Id)
- `sortOrder` (asc|desc): Sort direction (default: desc)

**Response Format**:

```json
{
  "status": "success",
  "message": "Wallet inquiries retrieved successfully",
  "data": [
    {
      "Id": 1,
      "Amount": 100.0,
      "Description": "Wallet transaction",
      "isDebit": true,
      "TxnDate": "2025-10-26T00:00:00.000Z",
      "Account_Id": 5,
      "AccountName": "Personal Wallet",
      "Currency": "USD",
      "AccountType": "WALLET",
      "PersonName": "John Doe"
    }
  ],
  "timestamp": "2025-10-26T10:30:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

## Implementation Details

### Files Modified:

1. **src/services/expenseService.ts**

   - Added `getAllWalletInquiries()` method
   - Filters expenses to only include accounts with `Type = 'WALLET'`
   - Uses same logic as `getAllExpenses()` but with WALLET type filter

2. **src/controllers/expenseController.ts**

   - Added `getAllWalletInquiries()` controller method
   - Handles request parsing and response formatting
   - Same parameter handling as `getAllExpenses()`

3. **src/routes/expenses.ts**
   - Added new route for `/wallet-inquiries`
   - Uses existing validation middleware
   - Positioned before parameterized routes to avoid conflicts

### Key Features:

- **Type Filtering**: Only returns expenses from accounts where `pa.Type = 'WALLET'`
- **Full Compatibility**: Supports all the same filters and pagination as the main expenses API
- **Consistent Response**: Uses the same response format and structure
- **Performance**: Database-level filtering for efficiency
- **Validation**: Uses existing validation middleware

### SQL Query Example:

```sql
SELECT e.Id, e.Amount, e.Description, e.isDebit, e.TxnDate, e.Account_Id,
       ISNULL(pa.Account, 'No Account') as AccountName,
       ISNULL(pa.Currency, '') as Currency,
       ISNULL(pa.Type, '') as AccountType,
       ISNULL(p.Name, 'Unknown Person') as PersonName
FROM Expense_Details e
LEFT JOIN Person_Account pa ON e.Account_Id = pa.Id
LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
WHERE pa.Type = 'WALLET'
ORDER BY e.TxnDate DESC, e.Id DESC
OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY
```

## Usage Examples:

```bash
# Get all wallet inquiries
GET /api/v1/expenses/wallet-inquiries

# Get wallet inquiries with pagination
GET /api/v1/expenses/wallet-inquiries?page=1&limit=10

# Filter wallet inquiries by date range
GET /api/v1/expenses/wallet-inquiries?dateFrom=2025-01-01&dateTo=2025-12-31

# Search wallet inquiries by description
GET /api/v1/expenses/wallet-inquiries?search=grocery

# Sort wallet inquiries by amount descending
GET /api/v1/expenses/wallet-inquiries?sortBy=Amount&sortOrder=desc

# Filter wallet inquiries by amount range
GET /api/v1/expenses/wallet-inquiries?amountMin=10&amountMax=100
```

## Comparison with Existing APIs:

| Endpoint                            | Account Type Filter    | Purpose                      |
| ----------------------------------- | ---------------------- | ---------------------------- |
| `/api/v1/expenses`                  | `Type = 'Transaction'` | Regular transaction expenses |
| `/api/v1/expenses/wallet-inquiries` | `Type = 'WALLET'`      | Wallet-specific expenses     |

Both endpoints provide:

- Same filtering capabilities
- Same pagination support
- Same response format
- Same validation rules

## Testing:

Use the provided test script to verify functionality:

```bash
node test-wallet-inquiries.js
```

The test script will:

- Check account type distribution
- Test the wallet inquiries endpoint
- Verify WALLET type filtering
- Compare with transaction expenses
- Test filtering and sorting capabilities
