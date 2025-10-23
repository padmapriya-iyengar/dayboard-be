import { Request, Response } from "express";
import { PersonService } from "../services/personService";
import { PaginationOptions } from "../types";
import { successResponse, errorResponse, catchAsync } from "../utils/helpers";

export class PersonController {
  /**
   * Get all persons with pagination
   */
  static readonly getAllPersons = catchAsync(
    async (req: Request, res: Response) => {
      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await PersonService.getAllPersons(pagination);

      return res.status(200).json(
        successResponse("Persons retrieved successfully", {
          persons: result.data,
          pagination: result.pagination,
        })
      );
    }
  );

  /**
   * Get person by ID
   */
  static readonly getPersonById = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const person = await PersonService.getPersonById(id);

      if (!person) {
        return res.status(404).json(errorResponse("Person not found"));
      }

      return res
        .status(200)
        .json(successResponse("Person retrieved successfully", { person }));
    }
  );

  /**
   * Create new person
   */
  static readonly createPerson = catchAsync(
    async (req: Request, res: Response) => {
      const person = await PersonService.createPerson(req.body);
      return res
        .status(201)
        .json(successResponse("Person created successfully", { person }));
    }
  );

  /**
   * Update person
   */
  static readonly updatePerson = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const person = await PersonService.updatePerson(id, req.body);

      if (!person) {
        return res.status(404).json(errorResponse("Person not found"));
      }

      return res
        .status(200)
        .json(successResponse("Person updated successfully", { person }));
    }
  );

  /**
   * Delete person
   */
  static readonly deletePerson = catchAsync(
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const deleted = await PersonService.deletePerson(id);

      if (!deleted) {
        return res.status(404).json(errorResponse("Person not found"));
      }

      return res
        .status(200)
        .json(successResponse("Person deleted successfully"));
    }
  );

  /**
   * Get persons with expense counts
   */
  static readonly getPersonsWithExpenseCounts = catchAsync(
    async (req: Request, res: Response) => {
      const persons = await PersonService.getPersonsWithExpenseCounts();
      return res
        .status(200)
        .json(
          successResponse(
            "Persons with expense counts retrieved successfully",
            { persons }
          )
        );
    }
  );
}
