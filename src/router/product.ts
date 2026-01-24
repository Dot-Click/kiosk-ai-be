import express, { Router } from "express";
import * as product from "../controllers/productController";

const router: Router = express.Router();

// POST
router.route("/create").post(product.createProduct);

// GET
router.route("/all").get(product.getAllProducts);

export default router;
