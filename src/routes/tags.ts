import { Router } from "express";
import { ExpenseTagController } from "../controllers/expenseTagController";
import {
  validateExpenseData,
  createExpenseTagSchema,
  updateExpenseTagSchema,
  bulkCreateExpenseTagsSchema,
} from "../middleware/expenseValidation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExpenseTag:
 *       type: object
 *       required:
 *         - Expense_Id
 *         - Category_Id
 *       properties:
 *         Id:
 *           type: integer
 *           description: The auto-generated ID of the tag
 *         Expense_Id:
 *           type: integer
 *           description: The expense ID this tag belongs to
 *         Category_Id:
 *           type: integer
 *           description: The category ID for this tag
 *         Category_Value:
 *           type: string
 *           maxLength: 255
 *           description: Optional category-specific value
 *         CategoryName:
 *           type: string
 *           description: Category name (from joined query)
 *         CategoryDescription:
 *           type: string
 *           description: Category description (from joined query)
 *         ExpenseAmount:
 *           type: number
 *           description: Expense amount (from joined query)
 *         ExpenseDescription:
 *           type: string
 *           description: Expense description (from joined query)
 *         TxnDate:
 *           type: string
 *           format: date-time
 *           description: Transaction date (from joined query)
 *         AccountName:
 *           type: string
 *           description: Account name (from joined query)
 *       example:
 *         Id: 1
 *         Expense_Id: 123
 *         Category_Id: 5
 *         Category_Value: "Restaurant"
 *         CategoryName: "Food & Dining"
 *         ExpenseAmount: 25.50
 *
 *     CreateExpenseTag:
 *       type: object
 *       required:
 *         - Expense_Id
 *         - Category_Id
 *       properties:
 *         Expense_Id:
 *           type: integer
 *           description: The expense ID this tag belongs to
 *         Category_Id:
 *           type: integer
 *           description: The category ID for this tag
 *         Category_Value:
 *           type: string
 *           maxLength: 255
 *           description: Optional category-specific value
 *       example:
 *         Expense_Id: 123
 *         Category_Id: 5
 *         Category_Value: "Restaurant"
 *
 *     BulkCreateTags:
 *       type: object
 *       required:
 *         - expenseId
 *         - tagData
 *       properties:
 *         expenseId:
 *           type: integer
 *           description: The expense ID to create tags for
 *         tagData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Category_Id:
 *                 type: integer
 *               Category_Value:
 *                 type: string
 *       example:
 *         expenseId: 123
 *         tagData:
 *           - Category_Id: 1
 *             Category_Value: "Restaurant"
 *           - Category_Id: 2
 *             Category_Value: "Business Lunch"
 */

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     summary: Retrieve all expense tags
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for category name or value
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: expenseId
 *         schema:
 *           type: integer
 *         description: Filter by expense ID
 *       - in: query
 *         name: categoryValue
 *         schema:
 *           type: string
 *         description: Filter by category value
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: Filter by category name
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
 *           default: Tag
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
 *         description: Tags retrieved successfully
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
 *                     $ref: '#/components/schemas/ExpenseTag'
 *                 pagination:
 *                   type: object
 */
router.get("/", ExpenseTagController.getAllTags);

/**
 * @swagger
 * /api/v1/tags/expense/{expenseId}:
 *   get:
 *     summary: Get tags by expense ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
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
 *                     $ref: '#/components/schemas/ExpenseTag'
 *       404:
 *         description: Expense not found
 *       400:
 *         description: Invalid expense ID
 */
router.get("/expense/:expenseId", ExpenseTagController.getTagsByExpenseId);

/**
 * @swagger
 * /api/v1/tags/category/{categoryId}:
 *   get:
 *     summary: Get tags by category ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
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
 *                     $ref: '#/components/schemas/ExpenseTag'
 */
router.get("/category/:categoryId", ExpenseTagController.getTagsByCategoryId);

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     summary: Create new expense tag
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseTag'
 *     responses:
 *       201:
 *         description: Tag created successfully
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
 *                   $ref: '#/components/schemas/ExpenseTag'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Tag already exists for this expense and category
 */
router.post(
  "/",
  validateExpenseData(createExpenseTagSchema),
  ExpenseTagController.createTag
);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   put:
 *     summary: Update expense tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Category_Id:
 *                 type: integer
 *               Category_Value:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Tag updated successfully
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
 *                   $ref: '#/components/schemas/ExpenseTag'
 *       404:
 *         description: Tag not found
 *       400:
 *         description: Validation error or invalid ID
 */
router.put(
  "/:id",
  validateExpenseData(updateExpenseTagSchema),
  ExpenseTagController.updateTag
);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   delete:
 *     summary: Delete expense tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       404:
 *         description: Tag not found
 *       400:
 *         description: Invalid tag ID
 */
router.delete("/:id", ExpenseTagController.deleteTag);

/**
 * @swagger
 * /api/v1/tags/bulk:
 *   post:
 *     summary: Bulk create expense tags
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCreateTags'
 *     responses:
 *       201:
 *         description: Tags created successfully
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
 *                     $ref: '#/components/schemas/ExpenseTag'
 *       400:
 *         description: Validation error
 */
router.post(
  "/bulk",
  validateExpenseData(bulkCreateExpenseTagsSchema),
  ExpenseTagController.bulkCreateTags
);

/**
 * @swagger
 * /api/v1/tags/stats:
 *   get:
 *     summary: Get tag statistics by category
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Tag statistics retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: integer
 *                       categoryName:
 *                         type: string
 *                       tagCount:
 *                         type: integer
 *                       totalExpenseAmount:
 *                         type: number
 */
router.get("/stats", ExpenseTagController.getTagStatsByCategory);

export default router;
