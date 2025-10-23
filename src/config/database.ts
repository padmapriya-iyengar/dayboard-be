import sql from "mssql";

// SQL Server configuration
const dbConfig: sql.config = {
  server: process.env["DB_SERVER"] || "localhost",
  database: process.env["DB_NAME"] || "dayboard",
  port: parseInt(process.env["DB_PORT"] || "1433"),
  user: process.env["DB_USER"] || "dayboard",
  password: process.env["DB_PASSWORD"] || "dayboard",
  options: {
    encrypt: process.env["DB_ENCRYPT"] === "true",
    trustServerCertificate:
      process.env["DB_TRUST_SERVER_CERTIFICATE"] === "true",
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Global connection pool
let pool: sql.ConnectionPool | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log("🔌 Connecting to SQL Server...");
    console.log(`📍 Server: ${dbConfig.server}:${dbConfig.port}`);
    console.log(`🗂️  Database: ${dbConfig.database}`);
    console.log(`👤 User: ${dbConfig.user}`);

    // Create connection pool
    pool = new sql.ConnectionPool(dbConfig);

    // Connect to the database
    await pool.connect();

    console.log("✅ SQL Server connected successfully");

    // Test the connection
    const result = await pool.request().query("SELECT @@VERSION as version");
    console.log(
      "🔍 SQL Server Version:",
      result.recordset[0].version.split("\n")[0]
    );

    // Handle connection events
    pool.on("error", (err: Error) => {
      console.error("❌ SQL Server connection error:", err);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      if (pool) {
        await pool.close();
        console.log("🔄 SQL Server connection closed through app termination");
      }
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      if (pool) {
        await pool.close();
        console.log("🔄 SQL Server connection closed through app termination");
      }
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ SQL Server connection failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  }
};

// Get the connection pool
export const getPool = (): sql.ConnectionPool => {
  if (!pool) {
    throw new Error(
      "Database pool not initialized. Call connectDatabase() first."
    );
  }
  return pool;
};

// Execute a query with error handling
export const executeQuery = async (
  query: string,
  params?: any[]
): Promise<sql.IResult<any>> => {
  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters if provided
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
    }

    return await request.query(query);
  } catch (error) {
    console.error("❌ Query execution error:", error);
    throw error;
  }
};

// Execute a stored procedure
export const executeStoredProcedure = async (
  procedureName: string,
  params?: { [key: string]: any }
): Promise<sql.IResult<any>> => {
  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    return await request.execute(procedureName);
  } catch (error) {
    console.error("❌ Stored procedure execution error:", error);
    throw error;
  }
};
