import { Router } from "express";
import { PersonController } from "../controllers/personController";
import {
  validateExpenseData,
  validateExpenseParams,
  createPersonSchema,
  updatePersonSchema,
  personIdSchema,
} from "../middleware/expenseValidation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Person:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *         Name:
 *           type: string
 *           description: Person's name
 *           maxLength: 255
 *       required:
 *         - Name
 *     CreatePerson:
 *       type: object
 *       properties:
 *         Name:
 *           type: string
 *           description: Person's name
 *           maxLength: 255
 *       required:
 *         - Name
 *     UpdatePerson:
 *       type: object
 *       properties:
 *         Name:
 *           type: string
 *           description: Person's name
 *           maxLength: 255
 */

/**
 * @swagger
 * /api/persons:
 *   get:
 *     summary: Get all persons with pagination
 *     tags: [Persons]
 *     parameters:
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
 *         description: Persons retrieved successfully
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
 *                   example: Persons retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     persons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Person'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *   post:
 *     summary: Create a new person
 *     tags: [Persons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePerson'
 *     responses:
 *       201:
 *         description: Person created successfully
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
 *                   example: Person created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     person:
 *                       $ref: '#/components/schemas/Person'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Person with this name already exists
 */
router.get("/", PersonController.getAllPersons);
router.post(
  "/",
  validateExpenseData(createPersonSchema),
  PersonController.createPerson
);

/**
 * @swagger
 * /api/persons/with-expense-counts:
 *   get:
 *     summary: Get all persons with their expense counts
 *     tags: [Persons]
 *     responses:
 *       200:
 *         description: Persons with expense counts retrieved successfully
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
 *                   example: Persons with expense counts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     persons:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Person'
 *                           - type: object
 *                             properties:
 *                               expenseCount:
 *                                 type: integer
 *                                 description: Number of expenses for this person
 */
router.get(
  "/with-expense-counts",
  PersonController.getPersonsWithExpenseCounts
);

/**
 * @swagger
 * /api/persons/{id}:
 *   get:
 *     summary: Get person by ID
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Person ID
 *     responses:
 *       200:
 *         description: Person retrieved successfully
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
 *                   example: Person retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     person:
 *                       $ref: '#/components/schemas/Person'
 *       404:
 *         description: Person not found
 *   put:
 *     summary: Update person by ID
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Person ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePerson'
 *     responses:
 *       200:
 *         description: Person updated successfully
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
 *                   example: Person updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     person:
 *                       $ref: '#/components/schemas/Person'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Person not found
 *       409:
 *         description: Person with this name already exists
 *   delete:
 *     summary: Delete person by ID
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Person ID
 *     responses:
 *       200:
 *         description: Person deleted successfully
 *       404:
 *         description: Person not found
 *       400:
 *         description: Cannot delete person as they have associated expenses
 */
router.get(
  "/:id",
  validateExpenseParams(personIdSchema),
  PersonController.getPersonById
);
router.put(
  "/:id",
  validateExpenseParams(personIdSchema),
  validateExpenseData(updatePersonSchema),
  PersonController.updatePerson
);
router.delete(
  "/:id",
  validateExpenseParams(personIdSchema),
  PersonController.deletePerson
);

export default router;
