import { Router } from "express";
import { PersonAccountController } from "../controllers/personAccountController";
import {
  validateExpenseData,
  validateExpenseParams,
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
  personIdSchema,
} from "../middleware/expenseValidation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonAccount:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         Person_Id:
 *           type: integer
 *           description: Reference to Person_Details table
 *         AccountName:
 *           type: string
 *           description: Name of the account
 *           maxLength: 255
 *         AccountType:
 *           type: string
 *           description: Type of account (e.g., Savings, Checking, Credit Card)
 *           maxLength: 100
 *         IsActive:
 *           type: boolean
 *           description: Whether the account is active
 *         PersonName:
 *           type: string
 *           description: Name of the person (from joined query)
 *       required:
 *         - Person_Id
 *         - Account
 *     CreatePersonAccount:
 *       type: object
 *       properties:
 *         Person_Id:
 *           type: integer
 *           description: Reference to Person_Details table
 *         Account:
 *           type: string
 *           description: Name of the account
 *           maxLength: 255
 *         Currency:
 *           type: string
 *           description: Account currency (optional)
 *           maxLength: 10
 *       required:
 *         - Person_Id
 *         - Account
 *     UpdatePersonAccount:
 *       type: object
 *       properties:
 *         Person_Id:
 *           type: integer
 *           description: Reference to Person_Details table
 *         Account:
 *           type: string
 *           description: Name of the account
 *           maxLength: 255
 *         Currency:
 *           type: string
 *           description: Account currency
 *           maxLength: 10
 */

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts with pagination and optional person filtering
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: Person_Id
 *         schema:
 *           type: integer
 *         description: Filter accounts by person ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePersonAccount'
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Person not found
 */
router.get("/", PersonAccountController.getAllAccounts);
router.post(
  "/",
  validateExpenseData(createAccountSchema),
  PersonAccountController.createAccount
);

/**
 * @swagger
 * /api/accounts/with-expense-counts:
 *   get:
 *     summary: Get all accounts with their expense counts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Accounts with expense counts retrieved successfully
 */
router.get(
  "/with-expense-counts",
  PersonAccountController.getAccountsWithExpenseCounts
);

/**
 * @swagger
 * /api/accounts/person/{personId}:
 *   get:
 *     summary: Get accounts by person ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Person ID
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 */
router.get(
  "/person/:personId",
  validateExpenseParams(personIdSchema),
  PersonAccountController.getAccountsByPersonId
);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account retrieved successfully
 *       404:
 *         description: Account not found
 *   put:
 *     summary: Update account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePersonAccount'
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Account not found
 *   delete:
 *     summary: Delete account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       404:
 *         description: Account not found
 *       400:
 *         description: Cannot delete account as it has associated expenses
 */
router.get(
  "/:id",
  validateExpenseParams(accountIdSchema),
  PersonAccountController.getAccountById
);
router.put(
  "/:id",
  validateExpenseParams(accountIdSchema),
  validateExpenseData(updateAccountSchema),
  PersonAccountController.updateAccount
);
router.delete(
  "/:id",
  validateExpenseParams(accountIdSchema),
  PersonAccountController.deleteAccount
);

export default router;
