import express, { Request, Response } from "express";
import expenseRoutes from "./expenses";
import personRoutes from "./persons";
import accountRoutes from "./accounts";

const router = express.Router();

// Import route modules
// import authRoutes from './auth';
// import groceryRoutes from './grocery';
// import financeRoutes from './finance';
// import reminderRoutes from './reminder';
// import taskRoutes from './task';

// Welcome route
router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Welcome to DayBoard API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api/v1",
      expenses: "/api/v1/expenses",
      persons: "/api/v1/persons",
      accounts: "/api/v1/accounts",
      // auth: '/api/v1/auth',
      // grocery: '/api/v1/grocery',
      // finance: '/api/v1/finance',
      // reminder: '/api/v1/reminder',
      // task: '/api/v1/task'
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use("/expenses", expenseRoutes);
router.use("/persons", personRoutes);
router.use("/accounts", accountRoutes);

export default router;
