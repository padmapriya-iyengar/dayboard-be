import { Request, Response } from "express";
import { InstallmentService } from "../services/installmentService";
import {
  CreatePersonInstallment,
  UpdatePersonInstallment,
  InstallmentFilters,
  PaginationOptions,
} from "../types";

export class InstallmentController {
  /**
   * Get all installments with optional filtering and pagination
   */
  static async getAllInstallments(req: Request, res: Response): Promise<void> {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as "asc" | "desc";

      const pagination: PaginationOptions = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Parse filter parameters
      const filters: InstallmentFilters = {};

      if (req.query.Account_Id) {
        filters.Account_Id = parseInt(req.query.Account_Id as string);
      }

      if (req.query.Person_Id) {
        filters.Person_Id = parseInt(req.query.Person_Id as string);
      }

      if (req.query.isDebit !== undefined) {
        filters.isDebit = req.query.isDebit === "true";
      }

      if (req.query.amountMin) {
        filters.amountMin = parseFloat(req.query.amountMin as string);
      }

      if (req.query.amountMax) {
        filters.amountMax = parseFloat(req.query.amountMax as string);
      }

      if (req.query.startDateFrom) {
        filters.startDateFrom = new Date(req.query.startDateFrom as string);
      }

      if (req.query.startDateTo) {
        filters.startDateTo = new Date(req.query.startDateTo as string);
      }

      if (req.query.endDateFrom) {
        filters.endDateFrom = new Date(req.query.endDateFrom as string);
      }

      if (req.query.endDateTo) {
        filters.endDateTo = new Date(req.query.endDateTo as string);
      }

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const result = await InstallmentService.getAllInstallments(
        filters,
        pagination
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAllInstallments controller:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve installments",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get installment by ID
   */
  static async getInstallmentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid installment ID",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const installment = await InstallmentService.getInstallmentById(id);

      if (!installment) {
        res.status(404).json({
          status: "error",
          message: "Installment not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Installment retrieved successfully",
        data: installment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getInstallmentById controller:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve installment",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get installments by account ID
   */
  static async getInstallmentsByAccountId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const accountId = parseInt(req.params.accountId);

      if (isNaN(accountId)) {
        res.status(400).json({
          status: "error",
          message: "Invalid account ID",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const installments = await InstallmentService.getInstallmentsByAccountId(
        accountId
      );

      res.status(200).json({
        status: "success",
        message: "Account installments retrieved successfully",
        data: installments,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getInstallmentsByAccountId controller:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve account installments",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Create new installment
   */
  static async createInstallment(req: Request, res: Response): Promise<void> {
    try {
      const installmentData: CreatePersonInstallment = req.body;

      // Basic validation
      if (!installmentData.Account_Id) {
        res.status(400).json({
          status: "error",
          message: "Account_Id is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!installmentData.Amount) {
        res.status(400).json({
          status: "error",
          message: "Amount is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (installmentData.isDebit === undefined) {
        res.status(400).json({
          status: "error",
          message: "isDebit is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const newInstallment = await InstallmentService.createInstallment(
        installmentData
      );

      res.status(201).json({
        status: "success",
        message: "Installment created successfully",
        data: newInstallment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in createInstallment controller:", error);

      if (
        error instanceof Error &&
        error.message.includes("Account not found")
      ) {
        res.status(404).json({
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create installment",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update installment
   */
  static async updateInstallment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const installmentData: UpdatePersonInstallment = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid installment ID",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedInstallment = await InstallmentService.updateInstallment(
        id,
        installmentData
      );

      if (!updatedInstallment) {
        res.status(404).json({
          status: "error",
          message: "Installment not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Installment updated successfully",
        data: updatedInstallment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in updateInstallment controller:", error);

      if (
        error instanceof Error &&
        (error.message.includes("Account not found") ||
          error.message.includes("No fields to update"))
      ) {
        res.status(400).json({
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update installment",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete installment
   */
  static async deleteInstallment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid installment ID",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const deleted = await InstallmentService.deleteInstallment(id);

      if (!deleted) {
        res.status(404).json({
          status: "error",
          message: "Installment not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Installment deleted successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in deleteInstallment controller:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete installment",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get installment statistics
   */
  static async getInstallmentStats(req: Request, res: Response): Promise<void> {
    try {
      // Parse filter parameters (similar to getAllInstallments but only relevant filters)
      const filters: InstallmentFilters = {};

      if (req.query.Account_Id) {
        filters.Account_Id = parseInt(req.query.Account_Id as string);
      }

      if (req.query.Person_Id) {
        filters.Person_Id = parseInt(req.query.Person_Id as string);
      }

      if (req.query.isDebit !== undefined) {
        filters.isDebit = req.query.isDebit === "true";
      }

      if (req.query.startDateFrom) {
        filters.startDateFrom = new Date(req.query.startDateFrom as string);
      }

      if (req.query.startDateTo) {
        filters.startDateTo = new Date(req.query.startDateTo as string);
      }

      const stats = await InstallmentService.getInstallmentStats(filters);

      res.status(200).json({
        status: "success",
        message: "Installment statistics retrieved successfully",
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getInstallmentStats controller:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve installment statistics",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
