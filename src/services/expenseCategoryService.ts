import sql from "mssql";
import { getPool } from "../config/database";
import {
  ExpenseCategory,
  CreateExpenseCategory,
  UpdateExpenseCategory,
  CategoryFilters,
  PaginationOptions,
  PaginatedResponse,
} from "../types";

export class ExpenseCategoryService {
  /**
   * Get all expense categories with optional filtering and pagination
   */
  static async getAllCategories(
    filters: CategoryFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 0 }
  ): Promise<PaginatedResponse<ExpenseCategory>> {
    try {
      const pool = getPool();
      let request = pool.request();

      // Build WHERE clause dynamically
      const whereConditions: string[] = [];

      if (filters.search) {
        whereConditions.push(
          "(ec.Category LIKE @search OR ec.Description LIKE @search)"
        );
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }

      if (filters.Category) {
        whereConditions.push("ec.Category = @category");
        request.input("category", sql.NVarChar, filters.Category);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count first
      const countQuery = `SELECT COUNT(*) as total FROM Expense_Category ec ${whereClause}`;
      const countResult = await request.query(countQuery);
      const total = countResult.recordset[0].total;

      // Create new request for data query
      request = pool.request();

      // Re-add parameters for data query
      if (filters.search) {
        request.input("search", sql.NVarChar, `%${filters.search}%`);
      }
      if (filters.Category) {
        request.input("category", sql.NVarChar, filters.Category);
      }

      // Build ORDER BY clause
      const validSortColumns = ["Id", "Category", "Description"];
      const sortBy = validSortColumns.includes(pagination.sortBy || "")
        ? `ec.${pagination.sortBy}`
        : "ec.Category";
      const sortOrder = pagination.sortOrder === "desc" ? "DESC" : "ASC";
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

      // Get paginated data
      const dataQuery = `
        SELECT ec.Id, ec.Category, ec.Description
        FROM Expense_Category ec
        ${whereClause}
        ${orderByClause}${paginationClause}
      `;

      const dataResult = await request.query(dataQuery);

      return {
        status: "success",
        message: "Categories retrieved successfully",
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
      console.error("Error in getAllCategories:", error);
      throw new Error(
        `Failed to retrieve categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: number): Promise<ExpenseCategory | null> {
    try {
      const pool = getPool();
      const request = pool.request();

      request.input("id", sql.Int, id);

      const query = `
        SELECT ec.Id, ec.Category, ec.Description
        FROM Expense_Category ec
        WHERE ec.Id = @id
      `;

      const result = await request.query(query);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      throw new Error(
        `Failed to retrieve category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create new expense category
   */
  static async createCategory(
    categoryData: CreateExpenseCategory
  ): Promise<ExpenseCategory> {
    try {
      const pool = getPool();

      // Check if category name already exists
      const existingCategory = await pool
        .request()
        .input("category", sql.NVarChar, categoryData.Category)
        .query("SELECT Id FROM Expense_Category WHERE Category = @category");

      if (existingCategory.recordset.length > 0) {
        throw new Error("Category name already exists");
      }

      const result = await pool
        .request()
        .input("category", sql.NVarChar, categoryData.Category)
        .input("description", sql.NVarChar, categoryData.Description || null)
        .query(`
          INSERT INTO Expense_Category (Category, Description)
          OUTPUT INSERTED.Id, INSERTED.Category, INSERTED.Description
          VALUES (@category, @description)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in createCategory:", error);
      if (error instanceof Error && error.message.includes("already exists")) {
        throw error;
      }
      throw new Error(
        `Failed to create category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update expense category
   */
  static async updateCategory(
    id: number,
    categoryData: UpdateExpenseCategory
  ): Promise<ExpenseCategory | null> {
    try {
      const pool = getPool();
      const request = pool.request();

      const updateFields: string[] = [];

      if (categoryData.Category !== undefined) {
        // Check if new category name already exists (excluding current record)
        const existingCategory = await pool
          .request()
          .input("category", sql.NVarChar, categoryData.Category)
          .input("id", sql.Int, id)
          .query(
            "SELECT Id FROM Expense_Category WHERE Category = @category AND Id != @id"
          );

        if (existingCategory.recordset.length > 0) {
          throw new Error("Category name already exists");
        }

        updateFields.push("Category = @category");
        request.input("category", sql.NVarChar, categoryData.Category);
      }

      if (categoryData.Description !== undefined) {
        updateFields.push("Description = @description");
        request.input("description", sql.NVarChar, categoryData.Description);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      request.input("id", sql.Int, id);

      const result = await request.query(`
        UPDATE Expense_Category 
        SET ${updateFields.join(", ")}
        OUTPUT INSERTED.Id, INSERTED.Category, INSERTED.Description
        WHERE Id = @id
      `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in updateCategory:", error);
      if (
        error instanceof Error &&
        (error.message.includes("already exists") ||
          error.message.includes("No fields"))
      ) {
        throw error;
      }
      throw new Error(
        `Failed to update category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete expense category
   */
  static async deleteCategory(id: number): Promise<boolean> {
    try {
      const pool = getPool();

      // Check if category is used in any expense tags
      const usageCheck = await pool
        .request()
        .input("categoryId", sql.Int, id)
        .query(
          "SELECT COUNT(*) as count FROM Expense_Tags WHERE Category_Id = @categoryId"
        );

      if (usageCheck.recordset[0].count > 0) {
        throw new Error("Cannot delete category that is used in expense tags");
      }

      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Expense_Category WHERE Id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      if (
        error instanceof Error &&
        error.message.includes("used in expense tags")
      ) {
        throw error;
      }
      throw new Error(
        `Failed to delete category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get categories with usage statistics
   */
  static async getCategoriesWithUsage(): Promise<
    (ExpenseCategory & { usageCount: number })[]
  > {
    try {
      const pool = getPool();

      const result = await pool.request().query(`
        SELECT 
          ec.Id, 
          ec.Category, 
          ec.Description,
          COUNT(et.Id) as usageCount
        FROM Expense_Category ec
        LEFT JOIN Expense_Tags et ON ec.Id = et.Category_Id
        GROUP BY ec.Id, ec.Category, ec.Description
        ORDER BY ec.Category
      `);

      return result.recordset;
    } catch (error) {
      console.error("Error in getCategoriesWithUsage:", error);
      throw new Error(
        `Failed to retrieve categories with usage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
