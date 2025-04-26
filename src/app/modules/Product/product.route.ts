import express from "express";
import { ProductController } from "./product.controller";

const router = express.Router();

router.post("/", ProductController.productCreate);
router.delete("/:id", ProductController.productDelete);
router.get("/", ProductController.getAllProducts);

export const ProductRoutes = router;
