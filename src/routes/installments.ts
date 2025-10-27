import express from "express";
import { InstallmentController } from "../controllers/installmentController";
import {
  validateInstallment,
  validateInstallmentQuery,
  createInstallmentSchema,
  updateInstallmentSchema,
} from "../middleware/expenseValidation";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonInstallment:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         Account_Id:
 *           type: integer
 *           description: Reference to Person_Account table
 *         Amount:
 *           type: number
 *           description: Installment amount
 *         Description:
 *           type: string
 *           description: Description of the installment
 *           maxLength: 500
 *         isDebit:
 *           type: boolean
 *           description: Whether this is a debit (true) or credit (false)
 *         Start_Date:
 *           type: string
 *           format: date-time
 *           description: Start date of the installment
 *         End_Date:
 *           type: string
 *           format: date-time
 *           description: End date of the installment
 *         Type:
 *           type: string
 *           description: Type of the installment
 *         AccountName:
 *           type: string
 *           description: Name of the account (from joined query)
 *         Currency:
 *           type: string
 *           description: Account currency (from joined query)
 *         PersonName:
 *           type: string
 *           description: Name of the person (from joined query)
 *       required:
 *         - Account_Id
 *         - Amount
 *         - isDebit
 *     CreatePersonInstallment:
 *       type: object
 *       properties:
 *         Account_Id:
 *           type: integer
 *           description: Reference to Person_Account table
 *         Amount:
 *           type: number
 *           description: Installment amount
 *         Description:
 *           type: string
 *           description: Description of the installment (optional)
 *           maxLength: 500
 *         isDebit:
 *           type: boolean
 *           description: Whether this is a debit (true) or credit (false)
 *         Start_Date:
 *           type: string
 *           format: date-time
 *           description: Start date of the installment (optional)
 *         End_Date:
 *           type: string
 *           format: date-time
 *           description: End date of the installment (optional)
 *         Type:
 *           type: string
 *           description: Type of the installment (optional)
 *       required:
 *         - Account_Id
 *         - Amount
 *         - isDebit
 *     UpdatePersonInstallment:
 *       type: object
 *       properties:
 *         Account_Id:
 *           type: integer
 *           description: Reference to Person_Account table
 *         Amount:
 *           type: number
 *           description: Installment amount
 *         Description:
 *           type: string
 *           description: Description of the installment
 *           maxLength: 500
 *         isDebit:
 *           type: boolean
 *           description: Whether this is a debit (true) or credit (false)
 *         Start_Date:
 *           type: string
 *           format: date-time
 *           description: Start date of the installment
 *         End_Date:
 *           type: string
 *           format: date-time
 *           description: End date of the installment
 *         Type:
 *           type: string
 *           description: Type of the installment
 */

/**
 * @swagger
 * /api/installments:
 *   get:
 *     summary: Get all installments with pagination and optional filtering
 *     tags: [Installments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [Id, Amount, Description, Start_Date, End_Date, Account_Id]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: Account_Id
 *         schema:
 *           type: integer
 *         description: Filter by account ID
 *       - in: query
 *         name: Person_Id
 *         schema:
 *           type: integer
 *         description: Filter by person ID
 *       - in: query
 *         name: isDebit
 *         schema:
 *           type: boolean
 *         description: Filter by debit/credit type
 *       - in: query
 *         name: amountMin
 *         schema:
 *           type: number
 *         description: Minimum amount filter
 *       - in: query
 *         name: amountMax
 *         schema:
 *           type: number
 *         description: Maximum amount filter
 *       - in: query
 *         name: startDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date from
 *       - in: query
 *         name: startDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date to
 *       - in: query
 *         name: endDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date from
 *       - in: query
 *         name: endDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date to
 *     responses:
 *       200:
 *         description: Installments retrieved successfully
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
 *                   example: Installments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonInstallment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new installment
 *     tags: [Installments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePersonInstallment'
 *     responses:
 *       201:
 *         description: Installment created successfully
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
 *                   example: Installment created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PersonInstallment'
 *       400:
 *         description: Validation error or account not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  validateInstallmentQuery(),
  InstallmentController.getAllInstallments
);
router.post(
  "/",
  validateInstallment(createInstallmentSchema),
  InstallmentController.createInstallment
);

/**
 * @swagger
 * /api/installments/{id}:
 *   get:
 *     summary: Get installment by ID
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Installment ID
 *     responses:
 *       200:
 *         description: Installment retrieved successfully
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
 *                   example: Installment retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PersonInstallment'
 *       400:
 *         description: Invalid installment ID
 *       404:
 *         description: Installment not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update installment by ID
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Installment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePersonInstallment'
 *     responses:
 *       200:
 *         description: Installment updated successfully
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
 *                   example: Installment updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/PersonInstallment'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Installment not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete installment by ID
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Installment ID
 *     responses:
 *       200:
 *         description: Installment deleted successfully
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
 *                   example: Installment deleted successfully
 *       400:
 *         description: Invalid installment ID
 *       404:
 *         description: Installment not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", InstallmentController.getInstallmentById);
router.put(
  "/:id",
  validateInstallment(updateInstallmentSchema),
  InstallmentController.updateInstallment
);
router.delete("/:id", InstallmentController.deleteInstallment);

/**
 * @swagger
 * /api/installments/account/{accountId}:
 *   get:
 *     summary: Get all installments for a specific account
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account installments retrieved successfully
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
 *                   example: Account installments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonInstallment'
 *       400:
 *         description: Invalid account ID
 *       500:
 *         description: Internal server error
 */
router.get(
  "/account/:accountId",
  InstallmentController.getInstallmentsByAccountId
);

/**
 * @swagger
 * /api/installments/stats:
 *   get:
 *     summary: Get installment statistics
 *     tags: [Installments]
 *     parameters:
 *       - in: query
 *         name: Account_Id
 *         schema:
 *           type: integer
 *         description: Filter by account ID
 *       - in: query
 *         name: Person_Id
 *         schema:
 *           type: integer
 *         description: Filter by person ID
 *       - in: query
 *         name: isDebit
 *         schema:
 *           type: boolean
 *         description: Filter by debit/credit type
 *       - in: query
 *         name: startDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date from
 *       - in: query
 *         name: startDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date to
 *     responses:
 *       200:
 *         description: Installment statistics retrieved successfully
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
 *                   example: Installment statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       description: Total number of installments
 *                     totalDebitAmount:
 *                       type: number
 *                       description: Total amount of debit installments
 *                     totalCreditAmount:
 *                       type: number
 *                       description: Total amount of credit installments
 *                     totalAmount:
 *                       type: number
 *                       description: Total amount of all installments
 *                     averageAmount:
 *                       type: number
 *                       description: Average installment amount
 *                     debitCount:
 *                       type: integer
 *                       description: Number of debit installments
 *                     creditCount:
 *                       type: integer
 *                       description: Number of credit installments
 *                     earliestStartDate:
 *                       type: string
 *                       format: date-time
 *                       description: Earliest start date
 *                     latestEndDate:
 *                       type: string
 *                       format: date-time
 *                       description: Latest end date
 *       500:
 *         description: Internal server error
 */
router.get("/stats", InstallmentController.getInstallmentStats);

export default router;
