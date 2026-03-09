import express, { Router } from "express";
import * as product from "../controllers/productController";

const router: Router = express.Router();

/**
 * @swagger
 * /products/create:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create product
 *     description: Create a new product (admin/internal).
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           $ref: '#/definitions/ProductCreateRequest'
 *     responses:
 *       200:
 *         description: Product created
 *       400:
 *         description: Bad request
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/create").post(product.createProduct);

/**
 * @swagger
 * /products/all:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Returns list of all products.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Products retrieved
 *         schema:
 *           $ref: '#/definitions/ProductListResponse'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/all").get(product.getAllProducts);

/**
 * @swagger
 * /products/migrate:
 *   get:
 *     tags:
 *       - Products
 *     summary: Migrate/Seed store products
 *     description: Ensures T-shirt and Mug products exist with correct codes.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Migration successful
 */
router.route("/migrate").get(product.migrateProducts);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Update product
 *     description: Update an existing product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: body
 *         name: body
 *         schema:
 *           $ref: '#/definitions/ProductUpdateRequest'
 *     responses:
 *       200:
 *         description: Product updated
 */
router.route("/:id").put(product.updateProduct).delete(product.deleteProduct);

export default router;
