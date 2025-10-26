import express from "express";
import { PortfolioController } from "../controllers/portfolioController";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonPortfolio:
 *       type: object
 *       properties:
 *         personId:
 *           type: integer
 *           description: Unique identifier for the person
 *         personName:
 *           type: string
 *           description: Name of the person
 *         accounts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AccountPortfolio'
 *         totals:
 *           type: object
 *           properties:
 *             aed:
 *               $ref: '#/components/schemas/CurrencyAmounts'
 *             inr:
 *               $ref: '#/components/schemas/CurrencyAmounts'
 *
 *     AccountPortfolio:
 *       type: object
 *       properties:
 *         accountId:
 *           type: integer
 *           description: Unique identifier for the account
 *         accountName:
 *           type: string
 *           description: Name of the account
 *         currency:
 *           type: string
 *           enum: [AED, INR]
 *           description: Account currency
 *         amounts:
 *           $ref: '#/components/schemas/AccountAmounts'
 *         convertedAmounts:
 *           type: object
 *           properties:
 *             aed:
 *               $ref: '#/components/schemas/CurrencyAmounts'
 *             inr:
 *               $ref: '#/components/schemas/CurrencyAmounts'
 *
 *     AccountAmounts:
 *       type: object
 *       properties:
 *         totalAmount:
 *           type: number
 *           description: Total amount in original currency
 *         debitAmount:
 *           type: number
 *           description: Total debit amount
 *         creditAmount:
 *           type: number
 *           description: Total credit amount
 *         netAmount:
 *           type: number
 *           description: Net amount (credit - debit)
 *         expenseCount:
 *           type: integer
 *           description: Number of expense records
 *
 *     CurrencyAmounts:
 *       type: object
 *       properties:
 *         totalAmount:
 *           type: number
 *           description: Total amount
 *         debitAmount:
 *           type: number
 *           description: Total debit amount
 *         creditAmount:
 *           type: number
 *           description: Total credit amount
 *         netAmount:
 *           type: number
 *           description: Net amount (credit - debit)
 *
 *     PortfolioSummary:
 *       type: object
 *       properties:
 *         totalPersons:
 *           type: integer
 *           description: Total number of persons
 *         totalAccounts:
 *           type: integer
 *           description: Total number of accounts
 *         totalExpenses:
 *           type: integer
 *           description: Total number of expense records
 *         grandTotals:
 *           type: object
 *           properties:
 *             aed:
 *               $ref: '#/components/schemas/CurrencyAmounts'
 *             inr:
 *               $ref: '#/components/schemas/CurrencyAmounts'
 *         conversionRate:
 *           type: object
 *           properties:
 *             aedToInr:
 *               type: number
 *               description: AED to INR conversion rate
 *             inrToAed:
 *               type: number
 *               description: INR to AED conversion rate
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: When the portfolio was generated
 *
 *     PortfolioResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Portfolio data retrieved successfully
 *         data:
 *           type: object
 *           properties:
 *             summary:
 *               $ref: '#/components/schemas/PortfolioSummary'
 *             portfolios:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PersonPortfolio'
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get all portfolio data
 *     description: Retrieves portfolio data for all persons, showing expenses aggregated by person and account with amounts in both AED and INR currencies
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Portfolio data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioResponse'
 *             example:
 *               status: success
 *               message: Portfolio data retrieved successfully
 *               data:
 *                 summary:
 *                   totalPersons: 2
 *                   totalAccounts: 4
 *                   totalExpenses: 25
 *                   grandTotals:
 *                     aed:
 *                       totalAmount: 1500.00
 *                       debitAmount: 800.00
 *                       creditAmount: 700.00
 *                       netAmount: -100.00
 *                     inr:
 *                       totalAmount: 34500.00
 *                       debitAmount: 18400.00
 *                       creditAmount: 16100.00
 *                       netAmount: -2300.00
 *                   conversionRate:
 *                     aedToInr: 23
 *                     inrToAed: 0.043478
 *                   generatedAt: "2025-10-25T10:00:00.000Z"
 *                 portfolios:
 *                   - personId: 1
 *                     personName: "John Doe"
 *                     accounts:
 *                       - accountId: 1
 *                         accountName: "Savings AED"
 *                         currency: "AED"
 *                         amounts:
 *                           totalAmount: 1000.00
 *                           debitAmount: 600.00
 *                           creditAmount: 400.00
 *                           netAmount: -200.00
 *                           expenseCount: 15
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve portfolio data
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", PortfolioController.getAllPortfolios);

/**
 * @swagger
 * /api/portfolio/person/{personId}:
 *   get:
 *     summary: Get portfolio data for a specific person
 *     description: Retrieves portfolio data for a specific person, showing their accounts and expenses with amounts in both AED and INR currencies
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the person
 *         example: 1
 *     responses:
 *       200:
 *         description: Person portfolio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Person portfolio retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PersonPortfolio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid person ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid person ID provided
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Person not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Person not found or has no portfolio data
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get("/person/:personId", PortfolioController.getPersonPortfolio);

/**
 * @swagger
 * /api/portfolio/exchange-rates:
 *   get:
 *     summary: Get current exchange rates
 *     description: Retrieves the current exchange rates used for currency conversion (AED ↔ INR)
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Exchange rates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Exchange rates retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     aedToInr:
 *                       type: number
 *                       example: 23
 *                       description: AED to INR conversion rate
 *                     inrToAed:
 *                       type: number
 *                       example: 0.043478
 *                       description: INR to AED conversion rate
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       description: When the rates were last updated
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get("/exchange-rates", PortfolioController.getExchangeRates);

export default router;
