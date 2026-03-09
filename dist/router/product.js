"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product = __importStar(require("../controllers/productController"));
const router = express_1.default.Router();
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
exports.default = router;
//# sourceMappingURL=product.js.map