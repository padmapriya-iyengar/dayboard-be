import sql from "mssql";
import { getPool } from "../config/database";
import {
  PersonDetails,
  CreatePersonDetails,
  UpdatePersonDetails,
  PaginationOptions,
} from "../types";

export class PersonService {
  /**
   * Get all persons with optional pagination
   */
  static async getAllPersons(
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<{
    data: PersonDetails[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const pool = getPool();
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool
        .request()
        .query("SELECT COUNT(*) as total FROM Person_Details");

      const totalCount = countResult.recordset[0].total;
      const totalPages = Math.ceil(totalCount / limit);

      // Get paginated data
      const result = await pool
        .request()
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset).query(`
          SELECT Id, Name
          FROM Person_Details
          ORDER BY Id
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
      console.error("Error in getAllPersons:", error);
      throw new Error("Failed to retrieve persons");
    }
  }

  /**
   * Get person by ID
   */
  static async getPersonById(id: number): Promise<PersonDetails | null> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT Id, Name FROM Person_Details WHERE Id = @id");

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in getPersonById:", error);
      throw new Error("Failed to retrieve person");
    }
  }

  /**
   * Create new person
   */
  static async createPerson(
    personData: CreatePersonDetails
  ): Promise<PersonDetails> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("name", sql.NVarChar, personData.Name).query(`
          INSERT INTO Person_Details (Name)
          OUTPUT INSERTED.Id, INSERTED.Name
          VALUES (@name)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error in createPerson:", error);
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw new Error("Person with this name already exists");
      }
      throw new Error("Failed to create person");
    }
  }

  /**
   * Update person
   */
  static async updatePerson(
    id: number,
    personData: UpdatePersonDetails
  ): Promise<PersonDetails | null> {
    try {
      // First check if person exists
      const existingPerson = await this.getPersonById(id);
      if (!existingPerson) {
        return null;
      }

      const pool = getPool();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("name", sql.NVarChar, personData.Name).query(`
          UPDATE Person_Details 
          SET Name = @name
          OUTPUT INSERTED.Id, INSERTED.Name
          WHERE Id = @id
        `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error("Error in updatePerson:", error);
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw new Error("Person with this name already exists");
      }
      throw new Error("Failed to update person");
    }
  }

  /**
   * Delete person
   */
  static async deletePerson(id: number): Promise<boolean> {
    try {
      // First check if person exists
      const existingPerson = await this.getPersonById(id);
      if (!existingPerson) {
        return false;
      }

      // Check if person is referenced in expenses
      const pool = getPool();
      const expenseCheck = await pool
        .request()
        .input("personId", sql.Int, id)
        .query(
          "SELECT COUNT(*) as count FROM Expense_Details WHERE Person_Id = @personId"
        );

      if (expenseCheck.recordset[0].count > 0) {
        throw new Error(
          "Cannot delete person as they have associated expenses"
        );
      }

      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Person_Details WHERE Id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error in deletePerson:", error);
      if (
        error instanceof Error &&
        error.message.includes("associated expenses")
      ) {
        throw error; // Re-throw the specific error
      }
      throw new Error("Failed to delete person");
    }
  }

  /**
   * Get persons with expense counts (for reporting)
   */
  static async getPersonsWithExpenseCounts(): Promise<
    (PersonDetails & { expenseCount: number })[]
  > {
    try {
      const pool = getPool();
      const result = await pool.request().query(`
          SELECT 
            p.Id, 
            p.Name,
            COUNT(e.Id) as expenseCount
          FROM Person_Details p
          LEFT JOIN Expense_Details e ON p.Id = e.Person_Id
          GROUP BY p.Id, p.Name
          ORDER BY p.Name
        `);

      return result.recordset;
    } catch (error) {
      console.error("Error in getPersonsWithExpenseCounts:", error);
      throw new Error("Failed to retrieve persons with expense counts");
    }
  }
}
