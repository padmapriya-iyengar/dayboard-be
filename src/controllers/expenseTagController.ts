import { Request, Response } from "express";
import { ExpenseTagService } from "../services/expenseTagService";
import {
  CreateExpenseTag,
  UpdateExpenseTag,
  TagFilters,
  PaginationOptions,
  BulkCreateExpenseTags,
} from "../types";
import { catchAsync } from "../utils/helpers";

export class ExpenseTagController {
  /**
   * Get all expense tags with optional filtering and pagination
   */
  static readonly getAllTags = catchAsync(
    async (req: Request, res: Response) => {
      const filters: TagFilters = {
        search: req.query.search as string,
        Category_Id: req.query.categoryId
          ? Number.parseInt(req.query.categoryId as string)
          : undefined,
        Expense_Id: req.query.expenseId
          ? Number.parseInt(req.query.expenseId as string)
          : undefined,
        Category_Value: req.query.categoryValue as string,
        categoryName: req.query.categoryName as string,
      };

      const pagination: PaginationOptions = {
        page: Number.parseInt(req.query.page as string) || 1,
        limit: req.query.limit ? Number.parseInt(req.query.limit as string) : 0,
        sortBy: (req.query.sortBy as string) || "Tag",
        sortOrder:
          ((req.query.sortOrder as string)?.toLowerCase() as "asc" | "desc") ||
          "asc",
      };

      const result = await ExpenseTagService.getAllTags(filters, pagination);

      return res.status(200).json(result);
    }
  );

  /**
   * Get tags by expense ID
   */
  static readonly getTagsByExpenseId = catchAsync(
    async (req: Request, res: Response) => {
      const expenseId = Number.parseInt(req.params.expenseId);

      if (Number.isNaN(expenseId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid expense ID",
          timestamp: new Date().toISOString(),
        });
      }

      const tags = await ExpenseTagService.getTagsByExpenseId(expenseId);

      return res.status(200).json({
        status: "success",
        message: "Tags retrieved successfully",
        data: tags,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Get tags by category ID
   */
  static readonly getTagsByCategoryId = catchAsync(
    async (req: Request, res: Response) => {
      const categoryId = Number.parseInt(req.params.categoryId);

      if (Number.isNaN(categoryId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid category ID",
          timestamp: new Date().toISOString(),
        });
      }

      const tags = await ExpenseTagService.getTagsByCategoryId(categoryId);

      return res.status(200).json({
        status: "success",
        message: "Tags retrieved successfully",
        data: tags,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Create new expense tag
   */
  static readonly createTag = catchAsync(
    async (req: Request, res: Response) => {
      const tagData: CreateExpenseTag = req.body;

      const newTag = await ExpenseTagService.createTag(tagData);

      return res.status(201).json({
        status: "success",
        message: "Tag created successfully",
        data: newTag,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Update expense tag
   */
  static readonly updateTag = catchAsync(
    async (req: Request, res: Response) => {
      const id = Number.parseInt(req.params.id);
      const tagData: UpdateExpenseTag = req.body;

      if (Number.isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid tag ID",
          timestamp: new Date().toISOString(),
        });
      }

      const updatedTag = await ExpenseTagService.updateTag(id, tagData);

      if (!updatedTag) {
        return res.status(404).json({
          status: "error",
          message: "Tag not found",
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Tag updated successfully",
        data: updatedTag,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Delete expense tag
   */
  static readonly deleteTag = catchAsync(
    async (req: Request, res: Response) => {
      const id = Number.parseInt(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid tag ID",
          timestamp: new Date().toISOString(),
        });
      }

      const deleted = await ExpenseTagService.deleteTag(id);

      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "Tag not found",
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Tag deleted successfully",
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Bulk create expense tags
   */
  static readonly bulkCreateTags = catchAsync(
    async (req: Request, res: Response) => {
      const { expenseId, tagData }: BulkCreateExpenseTags = req.body;

      if (!expenseId || !Array.isArray(tagData) || tagData.length === 0) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid bulk create data. expenseId and tagData array required",
          timestamp: new Date().toISOString(),
        });
      }

      const result = await ExpenseTagService.bulkCreateTags(expenseId, tagData);

      return res.status(201).json({
        status: "success",
        message: `Successfully created ${result.length} tags.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    }
  );

  /**
   * Get tag statistics by category
   */
  static readonly getTagStatsByCategory = catchAsync(
    async (req: Request, res: Response) => {
      const categoryId = req.query.categoryId
        ? Number.parseInt(req.query.categoryId as string)
        : undefined;

      if (req.query.categoryId && Number.isNaN(categoryId as number)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid category ID",
          timestamp: new Date().toISOString(),
        });
      }

      const stats = await ExpenseTagService.getTagStatsByCategory();

      return res.status(200).json({
        status: "success",
        message: "Tag statistics retrieved successfully",
        data: stats,
        timestamp: new Date().toISOString(),
      });
    }
  );
}
