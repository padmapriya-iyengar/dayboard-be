// Person Details interface for the Person_Details table
export interface PersonDetails {
  Id?: number;
  Name: string;
}

// Interface for creating new person (without auto-generated fields)
export interface CreatePersonDetails {
  Name: string;
}

// Interface for updating person (all fields optional)
export interface UpdatePersonDetails {
  Name?: string;
}

// Person Account interface for the Person_Account table (matching actual DB schema)
export interface PersonAccount {
  Id?: number;
  Person_Id: number;
  Account: string; // Actual column name in database
  Currency?: string; // Additional field in database
  PersonName?: string; // For joined queries
}

// Interface for creating new account (without auto-generated fields)
export interface CreatePersonAccount {
  Person_Id: number;
  Account: string; // Actual column name in database
  Currency?: string; // Additional field in database
}

// Interface for updating account (all fields optional)
export interface UpdatePersonAccount {
  Person_Id?: number;
  Account?: string; // Actual column name in database
  Currency?: string; // Additional field in database
}

// Expense Details interface for the existing table (matching actual DB schema)
export interface ExpenseDetails {
  Id?: number;
  Amount: number;
  Description?: string;
  isDebit?: boolean;
  TxnDate?: Date;
  Account_Id?: number;
  AccountName?: string; // For joined queries (aliased from pa.Account)
  Currency?: string; // For joined queries from Person_Account
  PersonName?: string; // For joined queries through accounts
  [key: string]: any; // Allow for additional fields that might exist in the table
}

// Interface for creating new expense (without auto-generated fields)
export interface CreateExpenseDetails {
  Amount: number;
  Description?: string;
  isDebit?: boolean;
  TxnDate?: Date;
  Account_Id?: number;
}

// Interface for updating expense (all fields optional)
export interface UpdateExpenseDetails {
  Amount?: number;
  Description?: string;
  isDebit?: boolean;
  TxnDate?: Date;
  Account_Id?: number;
}

// Query filters for expenses (simplified based on available columns)
export interface ExpenseFilters {
  amountMin?: number;
  amountMax?: number;
  isDebit?: boolean;
  search?: string; // Will search in Description
  dateFrom?: Date;
  dateTo?: Date;
  Account_Id?: number; // Filter by account
  Person_Id?: number; // Filter by person (through account)
}

// Common response interface
export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
  timestamp: string;
}

// Pagination interface
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User interface (for future authentication)
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category interface
export interface Category {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

// Inventory item interface
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  expiryDate?: Date;
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shopping list item interface
export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  completed: boolean;
  completedAt?: Date;
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Finance entry interface
export interface FinanceEntry {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category?: string;
  date: Date;
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reminder interface
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority?: "low" | "medium" | "high";
  completed: boolean;
  completedAt?: Date;
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate?: Date;
  completedAt?: Date;
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
