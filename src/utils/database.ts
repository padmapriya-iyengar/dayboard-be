import fs from "fs";
import path from "path";
import { executeQuery } from "../config/database";

/**
 * Initialize the database schema
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("🔧 Initializing database schema...");

    // Read the schema SQL file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Split SQL statements by GO keyword
    const statements = schemaSql
      .split(/\r?\nGO\r?\n/)
      .filter((statement) => statement.trim().length > 0);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await executeQuery(statement.trim());
      }
    }

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

/**
 * Check if database tables exist
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await executeQuery(`
      SELECT COUNT(*) as table_count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_CATALOG = DB_NAME()
    `);

    const tableCount = result.recordset[0].table_count;
    console.log(`📊 Found ${tableCount} tables in database`);

    return tableCount > 0;
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return false;
  }
};
