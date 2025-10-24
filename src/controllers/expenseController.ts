import { Request, Response } from "express";
import { ExpenseService } from "../services/expenseService";
import { ExpenseFilters, PaginationOptions } from "../types";
import { successResponse, errorResponse, catchAsync } from "../utils/helpers";

export class ExpenseController {
  /**
   * Get all expenses with filtering and pagination
   */
  static readonly getAllExpenses = catchAsync(
    async (req: Request, res: Response) => {
      let isDebit: boolean | undefined;
      if (req.query.isDebit === "true") {
        isDebit = true;
      } else if (req.query.isDebit === "false") {
        isDebit = false;
      }

      const filters: ExpenseFilters = {
        isDebit,
        amountMin: req.query.amountMin
          ? parseFloat(req.query.amountMin as string)
          : undefined,
        amountMax: req.query.amountMax
          ? parseFloat(req.query.amountMax as string)
          : undefined,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom
          ? new Date(req.query.dateFrom as string)
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(req.query.dateTo as string)
          : undefined,
        Account_Id: req.query.Account_Id
          ? parseInt(req.query.Account_Id as string)
          : undefined,
        Person_Id: req.query.Person_Id
          ? parseInt(req.query.Person_Id as string)
          : undefined,
      };

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: (req.query.sortBy as string) || "TxnDate",
        sortOrder:
          ((req.query.sortOrder as string)?.toLowerCase() as "asc" | "desc") ||
          "desc",
      };

      const result = await ExpenseService.getAllExpenses(filters, pagination);
      res.status(200).json(result);
    }
  );

  /**
   * Get expense by ID
   */
  static readonly getExpenseById = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      const expense = await ExpenseService.getExpenseById(id);

      if (!expense) {
        return res.status(404).json(errorResponse("Expense not found"));
      }

      return res
        .status(200)
        .json(successResponse("Expense retrieved successfully", expense));
    }
  );

  /**
   * Create new expense
   */
  static readonly createExpense = catchAsync(
    async (req: Request, res: Response) => {
      const expenseData = {
        Amount: req.body.Amount,
        Description: req.body.Description,
        isDebit: req.body.isDebit,
        TxnDate: req.body.TxnDate ? new Date(req.body.TxnDate) : undefined,
        Account_Id: req.body.Account_Id,
      };

      const newExpense = await ExpenseService.createExpense(expenseData);

      return res
        .status(201)
        .json(successResponse("Expense created successfully", newExpense));
    }
  );

  /**
   * Update expense
   */
  static readonly updateExpense = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      // Check if expense exists
      const existingExpense = await ExpenseService.getExpenseById(id);
      if (!existingExpense) {
        return res.status(404).json(errorResponse("Expense not found"));
      }

      const updateData = {
        Amount: req.body.Amount,
        Description: req.body.Description,
        isDebit: req.body.isDebit,
        TxnDate: req.body.TxnDate ? new Date(req.body.TxnDate) : undefined,
        Account_Id: req.body.Account_Id,
      };

      const updatedExpense = await ExpenseService.updateExpense(id, updateData);

      return res
        .status(200)
        .json(successResponse("Expense updated successfully", updatedExpense));
    }
  );

  /**
   * Delete expense
   */
  static readonly deleteExpense = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      // Check if expense exists
      const existingExpense = await ExpenseService.getExpenseById(id);
      if (!existingExpense) {
        return res.status(404).json(errorResponse("Expense not found"));
      }

      await ExpenseService.deleteExpense(id);

      return res
        .status(200)
        .json(successResponse("Expense deleted successfully"));
    }
  );

  /**
   * Get expense statistics
   */
  static readonly getExpenseStats = catchAsync(
    async (req: Request, res: Response) => {
      let isDebit: boolean | undefined;
      if (req.query.isDebit === "true") {
        isDebit = true;
      } else if (req.query.isDebit === "false") {
        isDebit = false;
      }

      const filters: ExpenseFilters = {
        isDebit,
        amountMin: req.query.amountMin
          ? parseFloat(req.query.amountMin as string)
          : undefined,
        amountMax: req.query.amountMax
          ? parseFloat(req.query.amountMax as string)
          : undefined,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom
          ? new Date(req.query.dateFrom as string)
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(req.query.dateTo as string)
          : undefined,
      };

      const stats = await ExpenseService.getExpenseStats(filters);

      return res
        .status(200)
        .json(
          successResponse("Expense statistics retrieved successfully", stats)
        );
    }
  );

  /**
   * Get expenses grouped by type (debit/credit)
   */
  static readonly getExpensesByType = catchAsync(
    async (req: Request, res: Response) => {
      const filters: ExpenseFilters = {
        amountMin: req.query.amountMin
          ? parseFloat(req.query.amountMin as string)
          : undefined,
        amountMax: req.query.amountMax
          ? parseFloat(req.query.amountMax as string)
          : undefined,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom
          ? new Date(req.query.dateFrom as string)
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(req.query.dateTo as string)
          : undefined,
      };

      const typeData = await ExpenseService.getExpensesByType(filters);

      return res
        .status(200)
        .json(
          successResponse("Expenses by type retrieved successfully", typeData)
        );
    }
  );

  /**
   * Bulk delete expenses
   */
  static readonly bulkDeleteExpenses = catchAsync(
    async (req: Request, res: Response) => {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json(errorResponse("Array of expense IDs is required"));
      }

      const results = await Promise.allSettled(
        ids.map((id) => ExpenseService.deleteExpense(parseInt(id)))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.length - successful;

      return res
        .status(200)
        .json(
          successResponse(
            `Bulk delete completed: ${successful} successful, ${failed} failed`,
            { successful, failed, total: results.length }
          )
        );
    }
  );

  /**
   * Get expense summary for dashboard
   */
  static readonly getExpenseSummary = catchAsync(
    async (req: Request, res: Response) => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Get current month stats
      const monthlyStats = await ExpenseService.getExpenseStats({
        dateFrom: startOfMonth,
        dateTo: endOfMonth,
      });

      // Get current year stats
      const yearlyStats = await ExpenseService.getExpenseStats({
        dateFrom: startOfYear,
        dateTo: today,
      });

      // Get all time stats
      const totalStats = await ExpenseService.getExpenseStats();

      // Get type breakdown for current month
      const monthlyTypeBreakdown = await ExpenseService.getExpensesByType({
        dateFrom: startOfMonth,
        dateTo: endOfMonth,
      });

      // Get all time type breakdown
      const totalTypeBreakdown = await ExpenseService.getExpensesByType({});

      const summary = {
        currentMonth: {
          ...monthlyStats,
          period: `${startOfMonth.toISOString().split("T")[0]} to ${
            endOfMonth.toISOString().split("T")[0]
          }`,
        },
        currentYear: {
          ...yearlyStats,
          period: `${startOfYear.toISOString().split("T")[0]} to ${
            today.toISOString().split("T")[0]
          }`,
        },
        allTime: totalStats,
        monthlyTypeBreakdown,
        totalTypeBreakdown,
      };

      return res
        .status(200)
        .json(
          successResponse("Expense summary retrieved successfully", summary)
        );
    }
  );
}
