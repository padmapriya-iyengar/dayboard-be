import { Request, Response } from "express";
import { ExpenseCategoryService } from "../services/expenseCategoryService";
import {
  CreateExpenseCategory,
  UpdateExpenseCategory,
  CategoryFilters,
  PaginationOptions,
} from "../types";
import { catchAsync } from "../utils/helpers";

export class ExpenseCategoryController {
  /**
   * Get all expense categories with optional filtering and pagination
   */
  static readonly getAllCategories = catchAsync(
    async (req: Request, res: Response) => {
      const filters: CategoryFilters = {
        search: req.query.search as string,
        Category: req.query.Category as string,
      };

      const pagination: PaginationOptions = {
        page: Number.parseInt(req.query.page as string) || 1,
        limit: req.query.limit ? Number.parseInt(req.query.limit as string) : 0,
        sortBy: (req.query.sortBy as string) || "Category",
        sortOrder:
          ((req.query.sortOrder as string)?.toLowerCase() as "asc" | "desc") ||
          "asc",
      };

      const result = await ExpenseCategoryService.getAllCategories(
        filters,
        pagination
      );

      return res.status(200).json(result);
    }
  );

  /**
   * Get category by ID
   */
  static readonly getCategoryById = catchAsync(
    async (req: Request, res: Response) => {
      const id = Number.parseInt(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid category ID",
          timestamp: new Date().toISOString(),
        });
      }

      const category = await ExpenseCategoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Category retrieved successfully",
        data: category,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Create new expense category
   */
  static readonly createCategory = catchAsync(
    async (req: Request, res: Response) => {
      const categoryData: CreateExpenseCategory = req.body;

      const newCategory = await ExpenseCategoryService.createCategory(
        categoryData
      );

      return res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: newCategory,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Update expense category
   */
  static readonly updateCategory = catchAsync(
    async (req: Request, res: Response) => {
      const id = Number.parseInt(req.params.id);
      const categoryData: UpdateExpenseCategory = req.body;

      if (Number.isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid category ID",
          timestamp: new Date().toISOString(),
        });
      }

      const updatedCategory = await ExpenseCategoryService.updateCategory(
        id,
        categoryData
      );

      if (!updatedCategory) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Category updated successfully",
        data: updatedCategory,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Delete expense category
   */
  static readonly deleteCategory = catchAsync(
    async (req: Request, res: Response) => {
      const id = Number.parseInt(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid category ID",
          timestamp: new Date().toISOString(),
        });
      }

      const deleted = await ExpenseCategoryService.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Get categories with usage statistics
   */
  static readonly getCategoriesWithUsage = catchAsync(
    async (req: Request, res: Response) => {
      const categories = await ExpenseCategoryService.getCategoriesWithUsage();

      return res.status(200).json({
        status: "success",
        message: "Categories with usage statistics retrieved successfully",
        data: categories,
        timestamp: new Date().toISOString(),
      });
    }
  );
}
