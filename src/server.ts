import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { initializeDatabase, checkDatabaseHealth } from "./utils/database";

// Import routes
import apiRoutes from "./routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env["PORT"] || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"), // 15 minutes
  max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100"), // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] || "http://localhost:5173",
    credentials: true,
  })
);
app.use(compression()); // Compress responses
app.use(limiter); // Apply rate limiting
app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

// Health check endpoint
app.get("/health", async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    res.status(200).json({
      status: "success",
      message: "DayBoard API is running",
      timestamp: new Date().toISOString(),
      environment: process.env["NODE_ENV"] || "development",
      database: {
        status: dbHealthy ? "connected" : "disconnected",
        type: "SQL Server",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Service temporarily unavailable",
      timestamp: new Date().toISOString(),
      database: {
        status: "error",
        type: "SQL Server",
      },
    });
  }
});

// API routes
app.use(process.env["API_PREFIX"] || "/api/v1", apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Check if database schema exists and initialize if needed
    const isDatabaseHealthy = await checkDatabaseHealth();
    if (!isDatabaseHealthy) {
      console.log("🔧 Database schema not found, initializing...");
      await initializeDatabase();
    } else {
      console.log("✅ Database schema is healthy");
    }

    app.listen(PORT, () => {
      console.log(`🚀 DayBoard API server is running on port ${PORT}`);
      console.log(
        `📚 API Documentation: http://localhost:${PORT}${
          process.env["API_PREFIX"] || "/api/v1"
        }`
      );
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(
        `🌍 Environment: ${process.env["NODE_ENV"] || "development"}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED PROMISE REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();

export default app;
