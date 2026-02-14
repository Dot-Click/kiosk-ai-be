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

export default router;
