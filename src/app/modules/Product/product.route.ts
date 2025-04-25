import express from "express";
import { ProductController } from "./product.controller";

const router = express.Router();

router.post("/", ProductController.productCreate);
router.put("/:id", ProductController.productUpdate);
router.delete("/:id", ProductController.productDelete);
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getSingleProduct);

export const ProductRoutes = router;
