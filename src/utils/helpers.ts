import { ApiResponse } from "../types";

/**
 * Create a standardized API response
 */
export const createResponse = <T>(
  status: "success" | "error",
  message: string,
  data?: T
): ApiResponse<T> => {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create a success response
 */
export const successResponse = <T>(
  message: string,
  data?: T
): ApiResponse<T> => {
  return createResponse("success", message, data);
};

/**
 * Create an error response
 */
export const errorResponse = (message: string): ApiResponse => {
  return createResponse("error", message);
};

/**
 * Async wrapper to catch errors in async route handlers
 */
export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Generate a unique ID (simple implementation)
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, "");
};
