import Joi from "joi";

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

  Person_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Person_Id must be an integer",
    "number.positive": "Person_Id must be a positive number",
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

  Person_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Person_Id must be an integer",
    "number.positive": "Person_Id must be a positive number",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
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

  Person_Id: Joi.number().integer().positive().optional().messages({
    "number.integer": "Person_Id must be an integer",
    "number.positive": "Person_Id must be a positive number",
  }),

  page: Joi.number().integer().min(1).default(1).optional(),

  limit: Joi.number().integer().min(1).max(100).default(50).optional(),

  sortBy: Joi.string()
    .valid("Id", "Amount", "Description", "TxnDate", "Person_Id")
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
