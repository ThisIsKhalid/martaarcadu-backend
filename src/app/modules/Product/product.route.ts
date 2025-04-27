import express from "express";
import { ProductController } from "./product.controller";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";

const router = express.Router();

const upload = multer({
  storage: createStorage("product"),
});

const imageUpload = upload.single("image");

router.post("/",imageUpload, ProductController.productCreate);
router.delete("/:id", ProductController.productDelete);
router.get("/", ProductController.getAllProducts);

export const ProductRoutes = router;
