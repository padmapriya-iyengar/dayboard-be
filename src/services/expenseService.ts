import sql from "mssql";
import { getPool } from "../config/database";
import {
  ExpenseDetails,
  CreateExpenseDetails,
  UpdateExpenseDetails,
  ExpenseFilters,
  PaginationOptions,
  PaginatedResponse,
} from "../types";

export class ExpenseService {
  /**
   * Get all expenses with optional filtering and pagination
   */
  static async getAllExpenses(
    filters: ExpenseFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<ExpenseDetails>> {
    try {
      const pool = getPool();
      let request = pool.request();

      // Build WHERE clause dynamically
      const whereConditions: string[] = [];

      if (filters.isDebit !== undefined) {
        whereConditions.push("isDebit = @isDebit");
        request.input("isDebit", sql.Bit, filters.isDebit);
      }

      if (filters.amountMin !== undefined) {
        whereConditions.push("Amount >= @amountMin");
        request.input("amountMin", sql.Float, filters.amountMin);
      }

      if (filters.amountMax !== undefined) {
        whereConditions.push("Amount <= @amountMax");
        request.input("amountMax", sql.Float, filters.amountMax);
      }

      if (filters.search) {
        whereConditions.push("Description LIKE @search");
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      if (filters.dateFrom) {
        whereConditions.push("TxnDate >= @dateFrom");
        request.input("dateFrom", sql.Date, filters.dateFrom);
      }

      if (filters.dateTo) {
        whereConditions.push("TxnDate <= @dateTo");
        request.input("dateTo", sql.Date, filters.dateTo);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count first
      const countQuery = `SELECT COUNT(*) as total FROM Expense_Details ${whereClause}`;
      const countResult = await request.query(countQuery);
      const total = countResult.recordset[0].total;

      // Create new request for data query
      request = pool.request();

      // Re-add parameters for data query
      if (filters.isDebit !== undefined) {
        request.input("isDebit", sql.Bit, filters.isDebit);
      }
      if (filters.amountMin !== undefined) {
        request.input("amountMin", sql.Float, filters.amountMin);
      }
      if (filters.amountMax !== undefined) {
        request.input("amountMax", sql.Float, filters.amountMax);
      }
      if (filters.search) {
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }
      if (filters.dateFrom) {
        request.input("dateFrom", sql.Date, filters.dateFrom);
      }
      if (filters.dateTo) {
        request.input("dateTo", sql.Date, filters.dateTo);
      }

      // Calculate offset for pagination
      const offset = (pagination.page - 1) * pagination.limit;

      // Build ORDER BY clause
      const validSortColumns = ["Id", "Amount", "Description", "TxnDate"];
      const sortBy = validSortColumns.includes(pagination.sortBy || "")
        ? pagination.sortBy
        : "TxnDate";
      const sortOrder = pagination.sortOrder === "asc" ? "ASC" : "DESC";

      // Get paginated data
      const dataQuery = `
        SELECT Id, Amount, Description, isDebit, TxnDate
        FROM Expense_Details 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `;

      request.input("offset", sql.Int, offset);
      request.input("limit", sql.Int, pagination.limit);

      const dataResult = await request.query(dataQuery);

      return {
        status: "success",
        message: "Expenses retrieved successfully",
        data: dataResult.recordset,
        timestamp: new Date().toISOString(),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          pages: Math.ceil(total / pagination.limit),
        },
      };
    } catch (error) {
      console.error("Error in getAllExpenses:", error);
      throw new Error(
        `Failed to retrieve expenses: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get expense by ID
   */
  static async getExpenseById(id: number): Promise<ExpenseDetails | null> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("id", sql.Int, id);

      const query = `
        SELECT Id, Amount, Description, isDebit, TxnDate
        FROM Expense_Details 
        WHERE Id = @id
      `;

      const result = await request.query(query);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in getExpenseById:", error);
      throw new Error(
        `Failed to retrieve expense: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new expense
   */
  static async createExpense(
    expenseData: CreateExpenseDetails
  ): Promise<ExpenseDetails> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("amount", sql.Float, expenseData.Amount);
      request.input(
        "description",
        sql.NVarChar,
        expenseData.Description || null
      );
      request.input("isDebit", sql.Bit, expenseData.isDebit || false);
      request.input("txnDate", sql.Date, expenseData.TxnDate || new Date());

      const query = `
        INSERT INTO Expense_Details (Amount, Description, isDebit, TxnDate)
        OUTPUT INSERTED.Id, INSERTED.Amount, INSERTED.Description, INSERTED.isDebit, INSERTED.TxnDate
        VALUES (@amount, @description, @isDebit, @txnDate)
      `;

      const result = await request.query(query);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in createExpense:", error);
      throw new Error(
        `Failed to create expense: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update an expense
   */
  static async updateExpense(
    id: number,
    updateData: UpdateExpenseDetails
  ): Promise<ExpenseDetails> {
    try {
      const pool = getPool();
      const request = pool.request();

      const updateFields: string[] = [];

      if (updateData.Amount !== undefined) {
        updateFields.push("Amount = @amount");
        request.input("amount", sql.Float, updateData.Amount);
      }

      if (updateData.Description !== undefined) {
        updateFields.push("Description = @description");
        request.input("description", sql.NVarChar, updateData.Description);
      }

      if (updateData.isDebit !== undefined) {
        updateFields.push("isDebit = @isDebit");
        request.input("isDebit", sql.Bit, updateData.isDebit);
      }

      if (updateData.TxnDate !== undefined) {
        updateFields.push("TxnDate = @txnDate");
        request.input("txnDate", sql.Date, updateData.TxnDate);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      request.input("id", sql.Int, id);

      const query = `
        UPDATE Expense_Details 
        SET ${updateFields.join(", ")}
        OUTPUT INSERTED.Id, INSERTED.Amount, INSERTED.Description, INSERTED.isDebit, INSERTED.TxnDate
        WHERE Id = @id
      `;

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        throw new Error("Expense not found");
      }

      return result.recordset[0];
    } catch (error) {
      console.error("Error in updateExpense:", error);
      throw new Error(
        `Failed to update expense: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete an expense
   */
  static async deleteExpense(id: number): Promise<void> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("id", sql.Int, id);

      const query = `DELETE FROM Expense_Details WHERE Id = @id`;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        throw new Error("Expense not found");
      }
    } catch (error) {
      console.error("Error in deleteExpense:", error);
      throw new Error(
        `Failed to delete expense: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get expense statistics
   */
  static async getExpenseStats(filters: ExpenseFilters = {}): Promise<any> {
    try {
      const pool = getPool();
      const request = pool.request();

      // Build WHERE clause
      const whereConditions: string[] = [];

      if (filters.isDebit !== undefined) {
        whereConditions.push("isDebit = @isDebit");
        request.input("isDebit", sql.Bit, filters.isDebit);
      }

      if (filters.amountMin !== undefined) {
        whereConditions.push("Amount >= @amountMin");
        request.input("amountMin", sql.Float, filters.amountMin);
      }

      if (filters.amountMax !== undefined) {
        whereConditions.push("Amount <= @amountMax");
        request.input("amountMax", sql.Float, filters.amountMax);
      }

      if (filters.search) {
        whereConditions.push("Description LIKE @search");
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      if (filters.dateFrom) {
        whereConditions.push("TxnDate >= @dateFrom");
        request.input("dateFrom", sql.Date, filters.dateFrom);
      }

      if (filters.dateTo) {
        whereConditions.push("TxnDate <= @dateTo");
        request.input("dateTo", sql.Date, filters.dateTo);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
        SELECT 
          COUNT(*) as totalCount,
          COALESCE(SUM(Amount), 0) as totalAmount,
          COALESCE(AVG(Amount), 0) as averageAmount,
          COALESCE(MIN(Amount), 0) as minAmount,
          COALESCE(MAX(Amount), 0) as maxAmount,
          SUM(CASE WHEN isDebit = 1 THEN Amount ELSE 0 END) as totalDebits,
          SUM(CASE WHEN isDebit = 0 OR isDebit IS NULL THEN Amount ELSE 0 END) as totalCredits
        FROM Expense_Details 
        ${whereClause}
      `;

      const result = await request.query(query);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in getExpenseStats:", error);
      throw new Error(
        `Failed to get expense statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get expenses grouped by debit/credit type
   */
  static async getExpensesByType(filters: ExpenseFilters = {}): Promise<any[]> {
    try {
      const pool = getPool();
      const request = pool.request();

      // Build WHERE clause
      const whereConditions: string[] = [];

      if (filters.amountMin !== undefined) {
        whereConditions.push("Amount >= @amountMin");
        request.input("amountMin", sql.Float, filters.amountMin);
      }

      if (filters.amountMax !== undefined) {
        whereConditions.push("Amount <= @amountMax");
        request.input("amountMax", sql.Float, filters.amountMax);
      }

      if (filters.search) {
        whereConditions.push("Description LIKE @search");
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      if (filters.dateFrom) {
        whereConditions.push("TxnDate >= @dateFrom");
        request.input("dateFrom", sql.Date, filters.dateFrom);
      }

      if (filters.dateTo) {
        whereConditions.push("TxnDate <= @dateTo");
        request.input("dateTo", sql.Date, filters.dateTo);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
        SELECT 
          CASE 
            WHEN isDebit = 1 THEN 'Debit' 
            ELSE 'Credit' 
          END as type,
          COUNT(*) as count,
          SUM(Amount) as totalAmount,
          AVG(Amount) as averageAmount
        FROM Expense_Details 
        ${whereClause}
        GROUP BY isDebit
        ORDER BY type
      `;

      const result = await request.query(query);

      return result.recordset;
    } catch (error) {
      console.error("Error in getExpensesByType:", error);
      throw new Error(
        `Failed to get expenses by type: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
