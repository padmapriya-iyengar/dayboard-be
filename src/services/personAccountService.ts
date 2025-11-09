import sql from "mssql";
import { getPool } from "../config/database";
import {
  PersonAccount,
  CreatePersonAccount,
  UpdatePersonAccount,
  PaginationOptions,
} from "../types";

export class PersonAccountService {
  /**
   * Get all accounts with optional pagination and person filtering
   */
  static async getAllAccounts(
    personId?: number,
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<{
    data: PersonAccount[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const pool = getPool();
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      let whereClause = "";
      let request = pool.request();

      if (personId) {
        whereClause = "WHERE pa.Person_Id = @personId";
        request.input("personId", sql.Int, personId);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM Person_Account pa ${whereClause}`;
      const countResult = await request.query(countQuery);
      const totalCount = countResult.recordset[0].total;
      const totalPages = Math.ceil(totalCount / limit);

      // Create new request for data query
      request = pool.request();
      if (personId) {
        request.input("personId", sql.Int, personId);
      }

      // Get paginated data with person details
      const result = await request
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset).query(`
          SELECT 
            pa.Id, 
            pa.Person_Id, 
            pa.Account as AccountName, 
            pa.Currency, 
            pa.Type,
            pa.Balance,
            pa.Last_Updated_On,
            p.Name as PersonName
          FROM Person_Account pa
          INNER JOIN Person_Details p ON pa.Person_Id = p.Id
          ${whereClause}
          ORDER BY pa.Id
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);

      return {
        data: result.recordset,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
        },
      };
    } catch (error) {
      console.error("Error in getAllAccounts:", error);
      throw new Error("Failed to retrieve accounts");
    }
  }

  /**
   * Get account by ID
   */
  static async getAccountById(id: number): Promise<PersonAccount | null> {
    try {
      const pool = getPool();
      const result = await pool.request().input("id", sql.Int, id).query(`
          SELECT 
            pa.Id, 
            pa.Person_Id, 
            pa.Account as AccountName, 
            pa.Currency, 
            pa.Type,
            pa.Balance,
            pa.Last_Updated_On,
            p.Name as PersonName
          FROM Person_Account pa
          INNER JOIN Person_Details p ON pa.Person_Id = p.Id
          WHERE pa.Id = @id
        `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in getAccountById:", error);
      throw new Error("Failed to retrieve account");
    }
  }

  /**
   * Get accounts by person ID
   */
  static async getAccountsByPersonId(
    personId: number
  ): Promise<PersonAccount[]> {
    try {
      const pool = getPool();
      const result = await pool.request().input("personId", sql.Int, personId)
        .query(`
          SELECT 
            pa.Id, 
            pa.Person_Id, 
            pa.Account as AccountName, 
            pa.Currency, 
            pa.Type,
            pa.Balance,
            pa.Last_Updated_On,
            p.Name as PersonName
          FROM Person_Account pa
          INNER JOIN Person_Details p ON pa.Person_Id = p.Id
          WHERE pa.Person_Id = @personId
          ORDER BY pa.Account
        `);

      return result.recordset;
    } catch (error) {
      console.error("Error in getAccountsByPersonId:", error);
      throw new Error("Failed to retrieve accounts for person");
    }
  }

  /**
   * Create new account
   */
  static async createAccount(
    accountData: CreatePersonAccount
  ): Promise<PersonAccount> {
    try {
      const pool = getPool();

      // First check if person exists
      const personCheck = await pool
        .request()
        .input("personId", sql.Int, accountData.Person_Id)
        .query("SELECT Id FROM Person_Details WHERE Id = @personId");

      if (personCheck.recordset.length === 0) {
        throw new Error("Person not found");
      }

      const result = await pool
        .request()
        .input("personId", sql.Int, accountData.Person_Id)
        .input("account", sql.NVarChar, accountData.Account)
        .input("currency", sql.NVarChar, accountData.Currency || "USD")
        .input("type", sql.NVarChar, accountData.Type || null)
        .input("balance", sql.Decimal, accountData.Balance ?? 0).query(`
          INSERT INTO Person_Account (Person_Id, Account, Currency, Type, Balance, Last_Updated_On)
          OUTPUT INSERTED.Id, INSERTED.Person_Id, INSERTED.Account, INSERTED.Currency, INSERTED.Type, INSERTED.Balance, INSERTED.Last_Updated_On
          VALUES (@personId, @account, @currency, @type, @balance, GETDATE())
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in createAccount:", error);
      if (
        error instanceof Error &&
        error.message.includes("Person not found")
      ) {
        throw error;
      }
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw new Error(
          "Account with this name already exists for this person"
        );
      }
      throw new Error("Failed to create account");
    }
  }

  /**
   * Update account
   */
  static async updateAccount(
    id: number,
    accountData: UpdatePersonAccount
  ): Promise<PersonAccount | null> {
    try {
      // First check if account exists
      const existingAccount = await this.getAccountById(id);
      if (!existingAccount) {
        return null;
      }

      const pool = getPool();
      const updateFields: string[] = [];
      let request = pool.request();

      if (accountData.Person_Id !== undefined) {
        // Check if new person exists
        const personCheck = await pool
          .request()
          .input("personId", sql.Int, accountData.Person_Id)
          .query("SELECT Id FROM Person_Details WHERE Id = @personId");

        if (personCheck.recordset.length === 0) {
          throw new Error("Person not found");
        }

        updateFields.push("Person_Id = @personId");
        request.input("personId", sql.Int, accountData.Person_Id);
      }

      if (accountData.Account !== undefined) {
        updateFields.push("Account = @account");
        request.input("account", sql.NVarChar, accountData.Account);
      }

      if (accountData.Currency !== undefined) {
        updateFields.push("Currency = @currency");
        request.input("currency", sql.NVarChar, accountData.Currency);
      }

      if (accountData.Type !== undefined) {
        updateFields.push("Type = @type");
        request.input("type", sql.NVarChar, accountData.Type);
      }

      if (accountData.Balance !== undefined) {
        updateFields.push("Balance = @balance");
        request.input("balance", sql.Decimal, accountData.Balance);
      }

      if (accountData.Last_Updated_On !== undefined) {
        updateFields.push("Last_Updated_On = @lastUpdatedOn");
        request.input(
          "lastUpdatedOn",
          sql.DateTime,
          accountData.Last_Updated_On
        );
      }

      // Always update Last_Updated_On when any field is updated
      if (updateFields.length > 0 && !accountData.Last_Updated_On) {
        updateFields.push("Last_Updated_On = GETDATE()");
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      request.input("id", sql.Int, id);

      const result = await request.query(`
        UPDATE Person_Account 
        SET ${updateFields.join(", ")}
        OUTPUT INSERTED.Id, INSERTED.Person_Id, INSERTED.Account, INSERTED.Currency, INSERTED.Type, INSERTED.Balance, INSERTED.Last_Updated_On
        WHERE Id = @id
      `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in updateAccount:", error);
      if (
        error instanceof Error &&
        (error.message.includes("Person not found") ||
          error.message.includes("UNIQUE"))
      ) {
        throw error;
      }
      throw new Error("Failed to update account");
    }
  }

  /**
   * Delete account
   */
  static async deleteAccount(id: number): Promise<boolean> {
    try {
      // First check if account exists
      const existingAccount = await this.getAccountById(id);
      if (!existingAccount) {
        return false;
      }

      // Check if account is referenced in expenses
      const pool = getPool();
      const expenseCheck = await pool
        .request()
        .input("accountId", sql.Int, id)
        .query(
          "SELECT COUNT(*) as count FROM Expense_Details WHERE Account_Id = @accountId"
        );

      if (expenseCheck.recordset[0].count > 0) {
        throw new Error("Cannot delete account as it has associated expenses");
      }

      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Person_Account WHERE Id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      if (
        error instanceof Error &&
        error.message.includes("associated expenses")
      ) {
        throw error;
      }
      throw new Error("Failed to delete account");
    }
  }

  /**
   * Get accounts with expense counts (for reporting)
   */
  static async getAccountsWithExpenseCounts(): Promise<
    (PersonAccount & { expenseCount: number })[]
  > {
    try {
      const pool = getPool();
      const result = await pool.request().query(`
          SELECT 
            pa.Id, 
            pa.Person_Id, 
            pa.Account as AccountName, 
            pa.Currency, 
            pa.Type,
            pa.Balance,
            pa.Last_Updated_On,
            p.Name as PersonName,
            COUNT(e.Id) as expenseCount
          FROM Person_Account pa
          INNER JOIN Person_Details p ON pa.Person_Id = p.Id
          LEFT JOIN Expense_Details e ON pa.Id = e.Account_Id
          GROUP BY pa.Id, pa.Person_Id, pa.Account, pa.Currency, pa.Type, pa.Balance, pa.Last_Updated_On, p.Name
          ORDER BY p.Name, pa.Account
        `);

      return result.recordset;
    } catch (error) {
      console.error("Error in getAccountsWithExpenseCounts:", error);
      throw new Error("Failed to retrieve accounts with expense counts");
    }
  }
}
