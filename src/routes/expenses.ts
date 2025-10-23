import express from "express";
import { ExpenseController } from "../controllers/expenseController";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdSchema,
  expenseFiltersSchema,
  validateExpenseData,
  validateExpenseParams,
  validateExpenseQuery,
} from "../middleware/expenseValidation";

const router = express.Router();

// Create specific validation middleware
const validateCreateExpense = validateExpenseData(createExpenseSchema);
const validateUpdateExpense = validateExpenseData(updateExpenseSchema);
const validateExpenseId = validateExpenseParams(expenseIdSchema);
const validateExpenseFilters = validateExpenseQuery(expenseFiltersSchema);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses with filtering and pagination
 * @access  Public
 * @query   ?isDebit=boolean&dateFrom=date&dateTo=date&amountMin=number&amountMax=number&search=string&page=number&limit=number&sortBy=string&sortOrder=asc|desc
 */
router.get("/", validateExpenseFilters, ExpenseController.getAllExpenses);

/**
 * @route   GET /api/expenses/stats
 * @desc    Get expense statistics
 * @access  Public
 * @query   ?isDebit=boolean&dateFrom=date&dateTo=date&amountMin=number&amountMax=number&search=string
 */
router.get("/stats", validateExpenseFilters, ExpenseController.getExpenseStats);

/**
 * @route   GET /api/expenses/type-summary
 * @desc    Get expenses grouped by type (debit/credit)
 * @access  Public
 * @query   ?amountMin=number&amountMax=number&search=string
 */
router.get(
  "/type-summary",
  validateExpenseFilters,
  ExpenseController.getExpensesByType
);

/**
 * @route   GET /api/expenses/summary
 * @desc    Get expense summary for dashboard
 * @access  Public
 */
router.get("/summary", ExpenseController.getExpenseSummary);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get expense by ID
 * @access  Public
 */
router.get("/:id", validateExpenseId, ExpenseController.getExpenseById);

/**
 * @route   POST /api/expenses
 * @desc    Create new expense
 * @access  Public
 * @body    { Amount: number, Description?: string, isDebit?: boolean, TxnDate?: string }
 */
router.post("/", validateCreateExpense, ExpenseController.createExpense);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update expense
 * @access  Public
 * @body    { Amount?: number, Description?: string, isDebit?: boolean, TxnDate?: string }
 */
router.put(
  "/:id",
  validateExpenseId,
  validateUpdateExpense,
  ExpenseController.updateExpense
);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete expense
 * @access  Public
 */
router.delete("/:id", validateExpenseId, ExpenseController.deleteExpense);

/**
 * @route   DELETE /api/expenses
 * @desc    Bulk delete expenses
 * @access  Public
 * @body    { ids: number[] }
 */
router.delete("/", ExpenseController.bulkDeleteExpenses);

export default router;
