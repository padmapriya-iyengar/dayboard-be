import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// Validation schema for creating person
export const createPersonSchema = Joi.object({
  Name: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must have at least 1 character",
    "string.max": "Name must not exceed 255 characters",
    "any.required": "Name is required",
  }),
});

// Validation schema for updating person
export const updatePersonSchema = Joi.object({
  Name: Joi.string().trim().min(1).max(255).optional().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must have at least 1 character",
    "string.max": "Name must not exceed 255 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Validation schema for creating account
export const createAccountSchema = Joi.object({
  Person_Id: Joi.number().integer().positive().required().messages({
    "number.integer": "Person_Id must be an integer",
    "number.positive": "Person_Id must be a positive number",
    "any.required": "Person_Id is required",
  }),

  Account: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Account name cannot be empty",
    "string.min": "Account name must have at least 1 character",
    "string.max": "Account name must not exceed 255 characters",
    "any.required": "Account name is required",
  }),

  Currency: Joi.string().trim().max(10).optional().messages({
    "string.max": "Currency must not exceed 10 characters",
  }),

  Type: Joi.string().trim().max(50).optional().messages({
    "string.max": "Type must not exceed 50 characters",
  }),

  Balance: Joi.number().precision(2).optional().messages({
    "number.base": "Balance must be a number",
  }),
});

// Validation schema for updating account
export const updateAccountSchema = Joi.object({
  Person_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Person_Id must be an integer",
    "number.positive": "Person_Id must be a positive number",
  }),

  Account: Joi.string().trim().min(1).max(255).optional().messages({
    "string.empty": "Account name cannot be empty",
    "string.min": "Account name must have at least 1 character",
    "string.max": "Account name must not exceed 255 characters",
  }),

  Currency: Joi.string().trim().max(10).optional().messages({
    "string.max": "Currency must not exceed 10 characters",
  }),

  Type: Joi.string().trim().max(50).optional().messages({
    "string.max": "Type must not exceed 50 characters",
  }),

  Balance: Joi.number().precision(2).optional().messages({
    "number.base": "Balance must be a number",
  }),

  Last_Updated_On: Joi.date().optional().messages({
    "date.base": "Last_Updated_On must be a valid date",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Validation schema for creating expense (matching actual table columns)
export const createExpenseSchema = Joi.object({
  Amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),

  Description: Joi.string().trim().max(255).optional().allow("").messages({
    "string.max": "Description must not exceed 255 characters",
  }),

  isDebit: Joi.boolean().optional().messages({
    "boolean.base": "isDebit must be a boolean value",
  }),

  TxnDate: Joi.date().iso().optional().messages({
    "date.format": "TxnDate must be in ISO format (YYYY-MM-DD)",
  }),

  Account_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Account_Id must be an integer",
    "number.positive": "Account_Id must be a positive number",
  }),
});

// Validation schema for updating expense
export const updateExpenseSchema = Joi.object({
  Amount: Joi.number().positive().optional().messages({
    "number.positive": "Amount must be a positive number",
  }),

  Description: Joi.string().trim().max(255).optional().allow("").messages({
    "string.max": "Description must not exceed 255 characters",
  }),

  isDebit: Joi.boolean().optional().messages({
    "boolean.base": "isDebit must be a boolean value",
  }),

  TxnDate: Joi.date().iso().optional().messages({
    "date.format": "TxnDate must be in ISO format (YYYY-MM-DD)",
  }),

  Account_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Account_Id must be an integer",
    "number.positive": "Account_Id must be a positive number",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Validation schema for account ID parameter
export const accountIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive number",
    "any.required": "ID is required",
  }),
});

// Validation schema for person ID parameter
export const personIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive number",
    "any.required": "ID is required",
  }),
});

// Validation schema for expense ID parameter
export const expenseIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive number",
    "any.required": "ID is required",
  }),
});

// Validation schema for expense filters (updated for actual table schema)
export const expenseFiltersSchema = Joi.object({
  isDebit: Joi.boolean().optional().messages({
    "boolean.base": "isDebit must be a boolean value",
  }),

  amountMin: Joi.number().min(0).optional(),

  amountMax: Joi.number()
    .positive()
    .min(Joi.ref("amountMin"))
    .optional()
    .messages({
      "number.min": "Maximum amount must be greater than minimum amount",
    }),

  search: Joi.string().trim().max(255).optional(),

  dateFrom: Joi.date().iso().optional().messages({
    "date.format": "dateFrom must be in ISO format (YYYY-MM-DD)",
  }),

  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional().messages({
    "date.format": "dateTo must be in ISO format (YYYY-MM-DD)",
    "date.min": "End date must be after start date",
  }),

  Account_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Account_Id must be an integer",
    "number.positive": "Account_Id must be a positive number",
  }),

  Person_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Person_Id must be an integer",
    "number.positive": "Person_Id must be a positive number",
  }),

  page: Joi.number().integer().min(1).default(1).optional(),

  limit: Joi.number().integer().min(0).max(100).default(0).optional().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be 0 or greater (0 = unlimited)",
    "number.max": "Limit cannot exceed 100",
  }),

  sortBy: Joi.string()
    .valid("Id", "Amount", "Description", "TxnDate", "Account_Id")
    .default("TxnDate")
    .optional(),

  sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
});

// Validation middleware function
export const validateExpenseData = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }

    req.body = value;
    next();
  };
};

// Validation middleware for params
export const validateExpenseParams = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: "error",
        message: "Invalid parameters",
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }

    req.params = value;
    next();
  };
};

// Validation middleware for query parameters
export const validateExpenseQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }

    req.query = value;
    next();
  };
};

// Validation schema for creating installment
export const createInstallmentSchema = Joi.object({
  Account_Id: Joi.number().integer().positive().required().messages({
    "number.integer": "Account_Id must be an integer",
    "number.positive": "Account_Id must be a positive number",
    "any.required": "Account_Id is required",
  }),

  Amount: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),

  Description: Joi.string().trim().max(500).optional().messages({
    "string.max": "Description must not exceed 500 characters",
  }),

  isDebit: Joi.boolean().required().messages({
    "boolean.base": "isDebit must be a boolean value",
    "any.required": "isDebit is required",
  }),

  Start_Date: Joi.date().optional().messages({
    "date.base": "Start_Date must be a valid date",
  }),

  End_Date: Joi.date().min(Joi.ref("Start_Date")).optional().messages({
    "date.base": "End_Date must be a valid date",
    "date.min": "End_Date must be after or equal to Start_Date",
  }),

  Type: Joi.string().trim().max(100).optional().messages({
    "string.max": "Type must not exceed 100 characters",
  }),

  Active: Joi.boolean().optional().messages({
    "boolean.base": "Active must be a boolean value",
  }),
});

// Validation schema for updating installment
export const updateInstallmentSchema = Joi.object({
  Account_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Account_Id must be an integer",
    "number.positive": "Account_Id must be a positive number",
  }),

  Amount: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Amount must be a positive number",
  }),

  Description: Joi.string().trim().max(500).optional().messages({
    "string.max": "Description must not exceed 500 characters",
  }),

  isDebit: Joi.boolean().optional().messages({
    "boolean.base": "isDebit must be a boolean value",
  }),

  Start_Date: Joi.date().optional().messages({
    "date.base": "Start_Date must be a valid date",
  }),

  End_Date: Joi.date().optional().messages({
    "date.base": "End_Date must be a valid date",
  }),

  Type: Joi.string().trim().max(100).optional().messages({
    "string.max": "Type must not exceed 100 characters",
  }),

  Active: Joi.boolean().optional().messages({
    "boolean.base": "Active must be a boolean value",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Validation schema for installment query parameters
export const installmentQuerySchema = Joi.object({
  page: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().positive().max(100).optional(),
  sortBy: Joi.string()
    .valid(
      "Id",
      "Amount",
      "Description",
      "Start_Date",
      "End_Date",
      "Account_Id"
    )
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  Account_Id: Joi.number().integer().positive().optional(),
  Person_Id: Joi.number().integer().positive().optional(),
  isDebit: Joi.boolean().optional(),
  amountMin: Joi.number().positive().optional(),
  amountMax: Joi.number().positive().optional(),
  startDateFrom: Joi.date().optional(),
  startDateTo: Joi.date().optional(),
  endDateFrom: Joi.date().optional(),
  endDateTo: Joi.date().optional(),
  search: Joi.string().optional(),
});

// Middleware factory for installment validation
export const validateInstallment = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    req.body = value;
    next();
  };
};

// Middleware for installment query parameter validation
export const validateInstallmentQuery = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = installmentQuerySchema.validate(req.query);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    req.query = value;
    next();
  };
};
