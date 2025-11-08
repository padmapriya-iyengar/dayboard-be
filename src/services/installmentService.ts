import sql from "mssql";
import { getPool } from "../config/database";
import {
  PersonInstallment,
  CreatePersonInstallment,
  UpdatePersonInstallment,
  InstallmentFilters,
  PaginationOptions,
  PaginatedResponse,
} from "../types";

export class InstallmentService {
  /**
   * Get all installments with optional filtering and pagination
   */
  static async getAllInstallments(
    filters: InstallmentFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<PersonInstallment>> {
    try {
      const pool = getPool();
      let request = pool.request();

      // Build WHERE clause dynamically
      const whereConditions: string[] = [];

      if (filters.isDebit !== undefined) {
        whereConditions.push("i.isDebit = @isDebit");
        request.input("isDebit", sql.Bit, filters.isDebit);
      }

      if (filters.amountMin !== undefined) {
        whereConditions.push("i.Amount >= @amountMin");
        request.input("amountMin", sql.Decimal, filters.amountMin);
      }

      if (filters.amountMax !== undefined) {
        whereConditions.push("i.Amount <= @amountMax");
        request.input("amountMax", sql.Decimal, filters.amountMax);
      }

      if (filters.startDateFrom) {
        whereConditions.push("i.Start_Date >= @startDateFrom");
        request.input("startDateFrom", sql.DateTime, filters.startDateFrom);
      }

      if (filters.startDateTo) {
        whereConditions.push("i.Start_Date <= @startDateTo");
        request.input("startDateTo", sql.DateTime, filters.startDateTo);
      }

      if (filters.endDateFrom) {
        whereConditions.push("i.End_Date >= @endDateFrom");
        request.input("endDateFrom", sql.DateTime, filters.endDateFrom);
      }

      if (filters.endDateTo) {
        whereConditions.push("i.End_Date <= @endDateTo");
        request.input("endDateTo", sql.DateTime, filters.endDateTo);
      }

      if (filters.Account_Id !== undefined) {
        whereConditions.push("i.Account_Id = @accountId");
        request.input("accountId", sql.Int, filters.Account_Id);
      }

      if (filters.Person_Id !== undefined) {
        whereConditions.push("pa.Person_Id = @personId");
        request.input("personId", sql.Int, filters.Person_Id);
      }

      if (filters.search) {
        whereConditions.push("i.Description LIKE @search");
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count first
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM Person_Installments i
        LEFT JOIN Person_Account pa ON i.Account_Id = pa.Id
        ${whereClause}
      `;
      const countResult = await request.query(countQuery);
      const total = countResult.recordset[0].total;

      // Create new request for data query
      request = pool.request();

      // Re-add all input parameters for data query
      if (filters.isDebit !== undefined) {
        request.input("isDebit", sql.Bit, filters.isDebit);
      }
      if (filters.amountMin !== undefined) {
        request.input("amountMin", sql.Decimal, filters.amountMin);
      }
      if (filters.amountMax !== undefined) {
        request.input("amountMax", sql.Decimal, filters.amountMax);
      }
      if (filters.startDateFrom) {
        request.input("startDateFrom", sql.DateTime, filters.startDateFrom);
      }
      if (filters.startDateTo) {
        request.input("startDateTo", sql.DateTime, filters.startDateTo);
      }
      if (filters.endDateFrom) {
        request.input("endDateFrom", sql.DateTime, filters.endDateFrom);
      }
      if (filters.endDateTo) {
        request.input("endDateTo", sql.DateTime, filters.endDateTo);
      }
      if (filters.Account_Id !== undefined) {
        request.input("accountId", sql.Int, filters.Account_Id);
      }
      if (filters.Person_Id !== undefined) {
        request.input("personId", sql.Int, filters.Person_Id);
      }
      if (filters.search) {
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      // Calculate offset for pagination
      const offset = (pagination.page - 1) * pagination.limit;

      // Build ORDER BY clause - Always order by Start_Date DESC first (most recent first)
      const validSortColumns = [
        "Id",
        "Amount",
        "Description",
        "Start_Date",
        "End_Date",
        "Account_Id",
      ];

      const sortBy = validSortColumns.includes(pagination.sortBy || "")
        ? `i.${pagination.sortBy}`
        : "i.Start_Date";

      let sortOrder = "DESC";
      if (pagination.sortOrder === "asc") {
        sortOrder = "ASC";
      }

      // Build order by clause to avoid duplicate columns
      let orderByClause;
      if (pagination.sortBy === "Start_Date" || !pagination.sortBy) {
        // If sorting by Start_Date or no sort specified, use Start_Date with specified order + Id as secondary
        orderByClause = `ORDER BY i.Start_Date ${sortOrder}, i.Id DESC`;
      } else {
        // If sorting by other column, use Start_Date DESC as primary, then the specified column
        orderByClause = `ORDER BY i.Start_Date DESC, ${sortBy} ${sortOrder}`;
      }

      // Get paginated data with account and person details
      const dataQuery = `
        SELECT i.Id, i.Account_Id, i.Amount, i.Description, i.isDebit, i.Start_Date, i.End_Date, i.Type, i.Active,
               ISNULL(pa.Account, 'No Account') as AccountName,
               ISNULL(pa.Currency, '') as Currency,
               ISNULL(p.Name, 'Unknown Person') as PersonName
        FROM Person_Installments i
        LEFT JOIN Person_Account pa ON i.Account_Id = pa.Id
        LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
        ${whereClause}
        ${orderByClause}
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `;

      request.input("offset", sql.Int, offset);
      request.input("limit", sql.Int, pagination.limit);

      const dataResult = await request.query(dataQuery);

      return {
        status: "success",
        message: "Installments retrieved successfully",
        data: dataResult.recordset,
        timestamp: new Date().toISOString(),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          pages: Math.ceil(total / pagination.limit),
          hasNext: pagination.page < Math.ceil(total / pagination.limit),
          hasPrev: pagination.page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllInstallments:", error);
      throw new Error(
        `Failed to retrieve installments: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get installment by ID
   */
  static async getInstallmentById(
    id: number
  ): Promise<PersonInstallment | null> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("id", sql.Int, id);

      const query = `
        SELECT i.Id, i.Account_Id, i.Amount, i.Description, i.isDebit, i.Start_Date, i.End_Date, i.Type, i.Active,
               pa.Account as AccountName, pa.Currency, p.Name as PersonName
        FROM Person_Installments i
        LEFT JOIN Person_Account pa ON i.Account_Id = pa.Id
        LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
        WHERE i.Id = @id
      `;

      const result = await request.query(query);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in getInstallmentById:", error);
      throw new Error(
        `Failed to retrieve installment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get installments by account ID
   */
  static async getInstallmentsByAccountId(
    accountId: number
  ): Promise<PersonInstallment[]> {
    try {
      const pool = getPool();
      const result = await pool.request().input("accountId", sql.Int, accountId)
        .query(`
          SELECT i.Id, i.Account_Id, i.Amount, i.Description, i.isDebit, i.Start_Date, i.End_Date, i.Type, i.Active,
                 pa.Account as AccountName, pa.Currency, p.Name as PersonName
          FROM Person_Installments i
          LEFT JOIN Person_Account pa ON i.Account_Id = pa.Id
          LEFT JOIN Person_Details p ON pa.Person_Id = p.Id
          WHERE i.Account_Id = @accountId
          ORDER BY i.Start_Date DESC, i.Id DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error("Error in getInstallmentsByAccountId:", error);
      throw new Error("Failed to retrieve installments for account");
    }
  }

  /**
   * Create new installment
   */
  static async createInstallment(
    installmentData: CreatePersonInstallment
  ): Promise<PersonInstallment> {
    try {
      const pool = getPool();

      // First check if account exists
      const accountCheck = await pool
        .request()
        .input("accountId", sql.Int, installmentData.Account_Id)
        .query("SELECT Id FROM Person_Account WHERE Id = @accountId");

      if (accountCheck.recordset.length === 0) {
        throw new Error("Account not found");
      }

      const result = await pool
        .request()
        .input("accountId", sql.Int, installmentData.Account_Id)
        .input("amount", sql.Decimal, installmentData.Amount)
        .input("description", sql.NVarChar, installmentData.Description || null)
        .input("isDebit", sql.Bit, installmentData.isDebit)
        .input("startDate", sql.DateTime, installmentData.Start_Date || null)
        .input("endDate", sql.DateTime, installmentData.End_Date || null)
        .input("type", sql.NVarChar, installmentData.Type || null)
        .input("active", sql.Bit, installmentData.Active ?? true).query(`
          INSERT INTO Person_Installments (Account_Id, Amount, Description, isDebit, Start_Date, End_Date, Type, Active)
          OUTPUT INSERTED.Id, INSERTED.Account_Id, INSERTED.Amount, INSERTED.Description, INSERTED.isDebit, 
                 INSERTED.Start_Date, INSERTED.End_Date, INSERTED.Type, INSERTED.Active
          VALUES (@accountId, @amount, @description, @isDebit, @startDate, @endDate, @type, @active)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in createInstallment:", error);
      if (
        error instanceof Error &&
        error.message.includes("Account not found")
      ) {
        throw error;
      }
      throw new Error("Failed to create installment");
    }
  }

  /**
   * Update installment
   */
  static async updateInstallment(
    id: number,
    installmentData: UpdatePersonInstallment
  ): Promise<PersonInstallment | null> {
    try {
      const pool = getPool();
      const updateFields: string[] = [];
      let request = pool.request();

      if (installmentData.Account_Id !== undefined) {
        // Check if new account exists
        const accountCheck = await pool
          .request()
          .input("accountId", sql.Int, installmentData.Account_Id)
          .query("SELECT Id FROM Person_Account WHERE Id = @accountId");

        if (accountCheck.recordset.length === 0) {
          throw new Error("Account not found");
        }

        updateFields.push("Account_Id = @accountId");
        request.input("accountId", sql.Int, installmentData.Account_Id);
      }

      if (installmentData.Amount !== undefined) {
        updateFields.push("Amount = @amount");
        request.input("amount", sql.Decimal, installmentData.Amount);
      }

      if (installmentData.Description !== undefined) {
        updateFields.push("Description = @description");
        request.input("description", sql.NVarChar, installmentData.Description);
      }

      if (installmentData.isDebit !== undefined) {
        updateFields.push("isDebit = @isDebit");
        request.input("isDebit", sql.Bit, installmentData.isDebit);
      }

      if (installmentData.Start_Date !== undefined) {
        updateFields.push("Start_Date = @startDate");
        request.input("startDate", sql.DateTime, installmentData.Start_Date);
      }

      if (installmentData.End_Date !== undefined) {
        updateFields.push("End_Date = @endDate");
        request.input("endDate", sql.DateTime, installmentData.End_Date);
      }

      if (installmentData.Type !== undefined) {
        updateFields.push("Type = @type");
        request.input("type", sql.NVarChar, installmentData.Type);
      }

      if (installmentData.Active !== undefined) {
        updateFields.push("Active = @active");
        request.input("active", sql.Bit, installmentData.Active);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      request.input("id", sql.Int, id);

      const result = await request.query(`
        UPDATE Person_Installments 
        SET ${updateFields.join(", ")}
        OUTPUT INSERTED.Id, INSERTED.Account_Id, INSERTED.Amount, INSERTED.Description, INSERTED.isDebit,
               INSERTED.Start_Date, INSERTED.End_Date, INSERTED.Type, INSERTED.Active
        WHERE Id = @id
      `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in updateInstallment:", error);
      if (
        error instanceof Error &&
        (error.message.includes("Account not found") ||
          error.message.includes("No fields to update"))
      ) {
        throw error;
      }
      throw new Error("Failed to update installment");
    }
  }

  /**
   * Delete installment
   */
  static async deleteInstallment(id: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Person_Installments WHERE Id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error in deleteInstallment:", error);
      throw new Error("Failed to delete installment");
    }
  }

  /**
   * Get installment statistics
   */
  static async getInstallmentStats(
    filters: InstallmentFilters = {}
  ): Promise<any> {
    try {
      const pool = getPool();
      let request = pool.request();

      // Build WHERE clause for stats
      const whereConditions: string[] = [];

      if (filters.Account_Id !== undefined) {
        whereConditions.push("i.Account_Id = @accountId");
        request.input("accountId", sql.Int, filters.Account_Id);
      }

      if (filters.Person_Id !== undefined) {
        whereConditions.push("pa.Person_Id = @personId");
        request.input("personId", sql.Int, filters.Person_Id);
      }

      if (filters.isDebit !== undefined) {
        whereConditions.push("i.isDebit = @isDebit");
        request.input("isDebit", sql.Bit, filters.isDebit);
      }

      if (filters.startDateFrom) {
        whereConditions.push("i.Start_Date >= @startDateFrom");
        request.input("startDateFrom", sql.DateTime, filters.startDateFrom);
      }

      if (filters.startDateTo) {
        whereConditions.push("i.Start_Date <= @startDateTo");
        request.input("startDateTo", sql.DateTime, filters.startDateTo);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
        SELECT 
          COUNT(*) as totalCount,
          SUM(CASE WHEN i.isDebit = 1 THEN i.Amount ELSE 0 END) as totalDebitAmount,
          SUM(CASE WHEN i.isDebit = 0 THEN i.Amount ELSE 0 END) as totalCreditAmount,
          SUM(i.Amount) as totalAmount,
          AVG(i.Amount) as averageAmount,
          COUNT(CASE WHEN i.isDebit = 1 THEN 1 END) as debitCount,
          COUNT(CASE WHEN i.isDebit = 0 THEN 1 END) as creditCount,
          MIN(i.Start_Date) as earliestStartDate,
          MAX(i.End_Date) as latestEndDate
        FROM Person_Installments i
        LEFT JOIN Person_Account pa ON i.Account_Id = pa.Id
        ${whereClause}
      `;

      const result = await request.query(query);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in getInstallmentStats:", error);
      throw new Error(
        `Failed to get installment statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
