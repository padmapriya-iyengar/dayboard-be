import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found on this server!`,
    timestamp: new Date().toISOString(),
  });
};
