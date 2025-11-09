import { Router } from "express";
import { ExpenseCategoryController } from "../controllers/expenseCategoryController";
import {
  validateExpenseData,
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "../middleware/expenseValidation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExpenseCategory:
 *       type: object
 *       required:
 *         - Category
 *       properties:
 *         Id:
 *           type: integer
 *           description: The auto-generated ID of the category
 *         Category:
 *           type: string
 *           maxLength: 255
 *           description: The category name
 *         Description:
 *           type: string
 *           maxLength: 500
 *           description: The category description
 *       example:
 *         Id: 1
 *         Category: "Food & Dining"
 *         Description: "All food and dining related expenses"
 *
 *     CreateExpenseCategory:
 *       type: object
 *       required:
 *         - Category
 *       properties:
 *         Category:
 *           type: string
 *           maxLength: 255
 *           description: The category name
 *         Description:
 *           type: string
 *           maxLength: 500
 *           description: The category description
 *       example:
 *         Category: "Food & Dining"
 *         Description: "All food and dining related expenses"
 *
 *     CategoryUsageStats:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *         Category:
 *           type: string
 *         Description:
 *           type: string
 *         tagCount:
 *           type: integer
 *           description: Number of tags using this category
 *       example:
 *         Id: 1
 *         Category: "Food & Dining"
 *         Description: "All food and dining related expenses"
 *         tagCount: 15
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Retrieve all expense categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for category name or description
 *       - in: query
 *         name: Category
 *         schema:
 *           type: string
 *         description: Filter by exact category name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items per page (0 for all)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: Category
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExpenseCategory'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/", ExpenseCategoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories/usage/stats:
 *   get:
 *     summary: Get categories with usage statistics
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories with usage stats retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryUsageStats'
 */
router.get("/usage/stats", ExpenseCategoryController.getCategoriesWithUsage);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseCategory'
 *       404:
 *         description: Category not found
 *       400:
 *         description: Invalid category ID
 */
router.get("/:id", ExpenseCategoryController.getCategoryById);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create new expense category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseCategory'
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseCategory'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Category already exists
 */
router.post(
  "/",
  validateExpenseData(createExpenseCategorySchema),
  ExpenseCategoryController.createCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update expense category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Category:
 *                 type: string
 *                 maxLength: 255
 *               Description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseCategory'
 *       404:
 *         description: Category not found
 *       400:
 *         description: Validation error or invalid ID
 */
router.put(
  "/:id",
  validateExpenseData(updateExpenseCategorySchema),
  ExpenseCategoryController.updateCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete expense category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       400:
 *         description: Invalid category ID or category is in use
 */
router.delete("/:id", ExpenseCategoryController.deleteCategory);

export default router;
