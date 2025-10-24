import { Request, Response } from "express";
import { PersonAccountService } from "../services/personAccountService";
import { PaginationOptions } from "../types";
import { successResponse, errorResponse, catchAsync } from "../utils/helpers";

export class PersonAccountController {
  /**
   * Get all accounts with pagination and optional person filtering
   */
  static readonly getAllAccounts = catchAsync(
    async (req: Request, res: Response) => {
      const personId = req.query.Person_Id
        ? parseInt(req.query.Person_Id as string)
        : undefined;

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await PersonAccountService.getAllAccounts(
        personId,
        pagination
      );

      return res.status(200).json(
        successResponse("Accounts retrieved successfully", {
          accounts: result.data,
          pagination: result.pagination,
        })
      );
    }
  );

  /**
   * Get account by ID
   */
  static readonly getAccountById = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const account = await PersonAccountService.getAccountById(id);

      if (!account) {
        return res.status(404).json(errorResponse("Account not found"));
      }

      return res
        .status(200)
        .json(successResponse("Account retrieved successfully", { account }));
    }
  );

  /**
   * Get accounts by person ID
   */
  static readonly getAccountsByPersonId = catchAsync(
    async (req: Request, res: Response) => {
      const personId = parseInt(req.params.personId);
      const accounts = await PersonAccountService.getAccountsByPersonId(
        personId
      );

      return res
        .status(200)
        .json(successResponse("Accounts retrieved successfully", { accounts }));
    }
  );

  /**
   * Create new account
   */
  static readonly createAccount = catchAsync(
    async (req: Request, res: Response) => {
      const account = await PersonAccountService.createAccount(req.body);
      return res
        .status(201)
        .json(successResponse("Account created successfully", { account }));
    }
  );

  /**
   * Update account
   */
  static readonly updateAccount = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const account = await PersonAccountService.updateAccount(id, req.body);

      if (!account) {
        return res.status(404).json(errorResponse("Account not found"));
      }

      return res
        .status(200)
        .json(successResponse("Account updated successfully", { account }));
    }
  );

  /**
   * Delete account
   */
  static readonly deleteAccount = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const deleted = await PersonAccountService.deleteAccount(id);

      if (!deleted) {
        return res.status(404).json(errorResponse("Account not found"));
      }

      return res
        .status(200)
        .json(successResponse("Account deleted successfully"));
    }
  );

  /**
   * Get accounts with expense counts
   */
  static readonly getAccountsWithExpenseCounts = catchAsync(
    async (req: Request, res: Response) => {
      const accounts =
        await PersonAccountService.getAccountsWithExpenseCounts();
      return res
        .status(200)
        .json(
          successResponse(
            "Accounts with expense counts retrieved successfully",
            { accounts }
          )
        );
    }
  );
}
