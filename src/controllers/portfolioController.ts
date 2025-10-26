import { Request, Response } from "express";
import { PortfolioService } from "../services/portfolioService";

export class PortfolioController {
  /**
   * Get all portfolio data
   */
  static async getAllPortfolios(req: Request, res: Response) {
    try {
      const result = await PortfolioService.getPortfolioData();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAllPortfolios:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve portfolio data",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get portfolio data for a specific person
   */
  static async getPersonPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const personId = parseInt(req.params.personId);

      if (!personId || isNaN(personId)) {
        res.status(400).json({
          status: "error",
          message: "Invalid person ID provided",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const portfolio = await PortfolioService.getPersonPortfolio(personId);

      if (!portfolio) {
        res.status(404).json({
          status: "error",
          message: "Person not found or has no portfolio data",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Person portfolio retrieved successfully",
        data: portfolio,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getPersonPortfolio:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve person portfolio",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current exchange rates
   */
  static async getExchangeRates(req: Request, res: Response) {
    try {
      const rates = PortfolioService.getExchangeRates();
      res.status(200).json({
        status: "success",
        message: "Exchange rates retrieved successfully",
        data: rates,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getExchangeRates:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve exchange rates",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
