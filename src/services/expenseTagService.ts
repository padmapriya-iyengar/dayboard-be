import sql from "mssql";
import { getPool } from "../config/database";
import {
  ExpenseTag,
  CreateExpenseTag,
  UpdateExpenseTag,
  TagFilters,
  PaginationOptions,
  PaginatedResponse,
} from "../types";

export class ExpenseTagService {
  /**
   * Get all expense tags with optional filtering and pagination
   */
  static async getAllTags(
    filters: TagFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 0 }
  ): Promise<PaginatedResponse<ExpenseTag>> {
    try {
      const pool = getPool();
      let request = pool.request();

      // Build WHERE clause dynamically
      const whereConditions: string[] = [];

      if (filters.search) {
        whereConditions.push(
          "(et.Category_Value LIKE @search OR ec.Category LIKE @search OR ed.Description LIKE @search)"
        );
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      if (filters.Expense_Id) {
        whereConditions.push("et.Expense_Id = @expenseId");
        request.input("expenseId", sql.Int, filters.Expense_Id);
      }

      if (filters.Category_Id) {
        whereConditions.push("et.Category_Id = @categoryId");
        request.input("categoryId", sql.Int, filters.Category_Id);
      }

      if (filters.Category_Value) {
        whereConditions.push("et.Category_Value LIKE @categoryValue");
        request.input(
          "categoryValue",
          sql.NVarChar,
          `%${filters.Category_Value}%`
        );
      }

      if (filters.categoryName) {
        whereConditions.push("ec.Category LIKE @categoryName");
        request.input(
          "categoryName",
          sql.NVarChar,
          `%${filters.categoryName}%`
        );
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count first
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM Expense_Tags et
        LEFT JOIN Expense_Category ec ON et.Category_Id = ec.Id
        LEFT JOIN Expense_Details ed ON et.Expense_Id = ed.Id
        ${whereClause}
      `;
      const countResult = await request.query(countQuery);
      const total = countResult.recordset[0].total;

      // Create new request for data query
      request = pool.request();

      // Re-add parameters for data query
      if (filters.search) {
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }
      if (filters.Expense_Id) {
        request.input("expenseId", sql.Int, filters.Expense_Id);
      }
      if (filters.Category_Id) {
        request.input("categoryId", sql.Int, filters.Category_Id);
      }
      if (filters.Category_Value) {
        request.input(
          "categoryValue",
          sql.NVarChar,
          `%${filters.Category_Value}%`
        );
      }
      if (filters.categoryName) {
        request.input(
          "categoryName",
          sql.NVarChar,
          `%${filters.categoryName}%`
        );
      }

      // Build ORDER BY clause
      const validSortColumns = [
        "Id",
        "Expense_Id",
        "Category_Id",
        "Category_Value",
        "TxnDate",
      ];
      const sortBy = validSortColumns.includes(pagination.sortBy || "")
        ? `et.${pagination.sortBy}`
        : "ed.TxnDate";
      const sortOrder = pagination.sortOrder === "asc" ? "ASC" : "DESC";
      const orderByClause = `ORDER BY ${sortBy} ${sortOrder}`;

      // Build pagination clause
      let paginationClause = "";
      if (pagination.limit && pagination.limit > 0) {
        const offset = (pagination.page - 1) * pagination.limit;
        paginationClause = `
          OFFSET @offset ROWS 
          FETCH NEXT @limit ROWS ONLY`;
        request.input("offset", sql.Int, offset);
        request.input("limit", sql.Int, pagination.limit);
      }

      // Get paginated data with joined information
      const dataQuery = `
        SELECT 
          et.Id,
          et.Expense_Id,
          et.Category_Id,
          et.Category_Value,
          ec.Category as CategoryName,
          ec.Description as CategoryDescription,
          ed.Amount as ExpenseAmount,
          ed.Description as ExpenseDescription,
          ed.TxnDate,
          pa.Account as AccountName
        FROM Expense_Tags et
        LEFT JOIN Expense_Category ec ON et.Category_Id = ec.Id
        LEFT JOIN Expense_Details ed ON et.Expense_Id = ed.Id
        LEFT JOIN Person_Account pa ON ed.Account_Id = pa.Id
        ${whereClause}
        ${orderByClause}${paginationClause}
      `;

      const dataResult = await request.query(dataQuery);

      return {
        status: "success",
        message: "Tags retrieved successfully",
        data: dataResult.recordset,
        timestamp: new Date().toISOString(),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          pages: pagination.limit > 0 ? Math.ceil(total / pagination.limit) : 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllTags:", error);
      throw new Error(
        `Failed to retrieve tags: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tag by ID
   */
  static async getTagById(id: number): Promise<ExpenseTag | null> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("id", sql.Int, id);

      const query = `
        SELECT 
          et.Id,
          et.Expense_Id,
          et.Category_Id,
          et.Category_Value,
          ec.Category as CategoryName,
          ec.Description as CategoryDescription,
          ed.Amount as ExpenseAmount,
          ed.Description as ExpenseDescription,
          ed.TxnDate,
          pa.Account as AccountName
        FROM Expense_Tags et
        LEFT JOIN Expense_Category ec ON et.Category_Id = ec.Id
        LEFT JOIN Expense_Details ed ON et.Expense_Id = ed.Id
        LEFT JOIN Person_Account pa ON ed.Account_Id = pa.Id
        WHERE et.Id = @id
      `;

      const result = await request.query(query);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in getTagById:", error);
      throw new Error(
        `Failed to retrieve tag: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tags by expense ID
   */
  static async getTagsByExpenseId(expenseId: number): Promise<ExpenseTag[]> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("expenseId", sql.Int, expenseId);

      const query = `
        SELECT 
          et.Id,
          et.Expense_Id,
          et.Category_Id,
          et.Category_Value,
          ec.Category as CategoryName,
          ec.Description as CategoryDescription
        FROM Expense_Tags et
        LEFT JOIN Expense_Category ec ON et.Category_Id = ec.Id
        WHERE et.Expense_Id = @expenseId
        ORDER BY ec.Category
      `;

      const result = await request.query(query);

      return result.recordset;
    } catch (error) {
      console.error("Error in getTagsByExpenseId:", error);
      throw new Error(
        `Failed to retrieve tags for expense: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tags by category ID
   */
  static async getTagsByCategoryId(categoryId: number): Promise<ExpenseTag[]> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("categoryId", sql.Int, categoryId);

      const query = `
        SELECT 
          et.Id,
          et.Expense_Id,
          et.Category_Id,
          et.Category_Value,
          ed.Amount as ExpenseAmount,
          ed.Description as ExpenseDescription,
          ed.TxnDate,
          pa.Account as AccountName
        FROM Expense_Tags et
        LEFT JOIN Expense_Details ed ON et.Expense_Id = ed.Id
        LEFT JOIN Person_Account pa ON ed.Account_Id = pa.Id
        WHERE et.Category_Id = @categoryId
        ORDER BY ed.TxnDate DESC
      `;

      const result = await request.query(query);

      return result.recordset;
    } catch (error) {
      console.error("Error in getTagsByCategoryId:", error);
      throw new Error(
        `Failed to retrieve tags for category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create new expense tag
   */
  static async createTag(tagData: CreateExpenseTag): Promise<ExpenseTag> {
    try {
      const pool = getPool();

      // Validate that expense exists
      const expenseCheck = await pool
        .request()
        .input("expenseId", sql.Int, tagData.Expense_Id)
        .query("SELECT Id FROM Expense_Details WHERE Id = @expenseId");

      if (expenseCheck.recordset.length === 0) {
        throw new Error("Expense not found");
      }

      // Validate that category exists
      const categoryCheck = await pool
        .request()
        .input("categoryId", sql.Int, tagData.Category_Id)
        .query("SELECT Id FROM Expense_Category WHERE Id = @categoryId");

      if (categoryCheck.recordset.length === 0) {
        throw new Error("Category not found");
      }

      // Check if this expense-category combination already exists
      const existingTag = await pool
        .request()
        .input("expenseId", sql.Int, tagData.Expense_Id)
        .input("categoryId", sql.Int, tagData.Category_Id)
        .query(
          "SELECT Id FROM Expense_Tags WHERE Expense_Id = @expenseId AND Category_Id = @categoryId"
        );

      if (existingTag.recordset.length > 0) {
        throw new Error("This expense is already tagged with this category");
      }

      const result = await pool
        .request()
        .input("expenseId", sql.Int, tagData.Expense_Id)
        .input("categoryId", sql.Int, tagData.Category_Id)
        .input("categoryValue", sql.NVarChar, tagData.Category_Value || null)
        .query(`
          INSERT INTO Expense_Tags (Expense_Id, Category_Id, Category_Value)
          OUTPUT INSERTED.Id, INSERTED.Expense_Id, INSERTED.Category_Id, INSERTED.Category_Value
          VALUES (@expenseId, @categoryId, @categoryValue)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in createTag:", error);
      if (
        error instanceof Error &&
        (error.message.includes("not found") ||
          error.message.includes("already tagged"))
      ) {
        throw error;
      }
      throw new Error(
        `Failed to create tag: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update expense tag
   */
  static async updateTag(
    id: number,
    tagData: UpdateExpenseTag
  ): Promise<ExpenseTag | null> {
    try {
      const pool = getPool();
      const request = pool.request();

      const updateFields: string[] = [];

      if (tagData.Category_Id !== undefined) {
        // Validate that category exists
        const categoryCheck = await pool
          .request()
          .input("categoryId", sql.Int, tagData.Category_Id)
          .query("SELECT Id FROM Expense_Category WHERE Id = @categoryId");

        if (categoryCheck.recordset.length === 0) {
          throw new Error("Category not found");
        }

        updateFields.push("Category_Id = @categoryId");
        request.input("categoryId", sql.Int, tagData.Category_Id);
      }

      if (tagData.Category_Value !== undefined) {
        updateFields.push("Category_Value = @categoryValue");
        request.input("categoryValue", sql.NVarChar, tagData.Category_Value);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      request.input("id", sql.Int, id);

      const result = await request.query(`
        UPDATE Expense_Tags 
        SET ${updateFields.join(", ")}
        OUTPUT INSERTED.Id, INSERTED.Expense_Id, INSERTED.Category_Id, INSERTED.Category_Value
        WHERE Id = @id
      `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in updateTag:", error);
      if (
        error instanceof Error &&
        (error.message.includes("not found") ||
          error.message.includes("No fields"))
      ) {
        throw error;
      }
      throw new Error(
        `Failed to update tag: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete expense tag
   */
  static async deleteTag(id: number): Promise<boolean> {
    try {
      const pool = getPool();

      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Expense_Tags WHERE Id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error in deleteTag:", error);
      throw new Error(
        `Failed to delete tag: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete all tags for an expense
   */
  static async deleteTagsByExpenseId(expenseId: number): Promise<boolean> {
    try {
      const pool = getPool();

      const result = await pool
        .request()
        .input("expenseId", sql.Int, expenseId)
        .query("DELETE FROM Expense_Tags WHERE Expense_Id = @expenseId");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error in deleteTagsByExpenseId:", error);
      throw new Error(
        `Failed to delete tags for expense: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Bulk create tags for an expense
   */
  static async bulkCreateTags(
    expenseId: number,
    tagData: Array<{ Category_Id: number; Category_Value?: string }>
  ): Promise<ExpenseTag[]> {
    try {
      const pool = getPool();

      // Validate that expense exists
      const expenseCheck = await pool
        .request()
        .input("expenseId", sql.Int, expenseId)
        .query("SELECT Id FROM Expense_Details WHERE Id = @expenseId");

      if (expenseCheck.recordset.length === 0) {
        throw new Error("Expense not found");
      }

      // Validate all categories exist
      const categoryIds = tagData.map((tag) => tag.Category_Id);
      const categoryCheck = await pool
        .request()
        .input("categoryIds", categoryIds)
        .query(
          "SELECT Id FROM Expense_Category WHERE Id IN (SELECT value FROM OPENJSON(@categoryIds))"
        );

      if (categoryCheck.recordset.length !== categoryIds.length) {
        throw new Error("One or more categories not found");
      }

      // Delete existing tags for this expense
      await this.deleteTagsByExpenseId(expenseId);

      // Insert new tags
      const results: ExpenseTag[] = [];

      for (const tag of tagData) {
        const result = await pool
          .request()
          .input("expenseId", sql.Int, expenseId)
          .input("categoryId", sql.Int, tag.Category_Id)
          .input("categoryValue", sql.NVarChar, tag.Category_Value || null)
          .query(`
            INSERT INTO Expense_Tags (Expense_Id, Category_Id, Category_Value)
            OUTPUT INSERTED.Id, INSERTED.Expense_Id, INSERTED.Category_Id, INSERTED.Category_Value
            VALUES (@expenseId, @categoryId, @categoryValue)
          `);

        results.push(result.recordset[0]);
      }

      return results;
    } catch (error) {
      console.error("Error in bulkCreateTags:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        throw error;
      }
      throw new Error(
        `Failed to bulk create tags: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tag statistics by category
   */
  static async getTagStatsByCategory(): Promise<
    Array<{
      categoryId: number;
      categoryName: string;
      tagCount: number;
      totalExpenseAmount: number;
    }>
  > {
    try {
      const pool = getPool();

      const result = await pool.request().query(`
        SELECT 
          ec.Id as categoryId,
          ec.Category as categoryName,
          COUNT(et.Id) as tagCount,
          ISNULL(SUM(ed.Amount), 0) as totalExpenseAmount
        FROM Expense_Category ec
        LEFT JOIN Expense_Tags et ON ec.Id = et.Category_Id
        LEFT JOIN Expense_Details ed ON et.Expense_Id = ed.Id
        GROUP BY ec.Id, ec.Category
        ORDER BY tagCount DESC, ec.Category
      `);

      return result.recordset;
    } catch (error) {
      console.error("Error in getTagStatsByCategory:", error);
      throw new Error(
        `Failed to retrieve tag statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
