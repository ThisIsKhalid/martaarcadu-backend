import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { CartController } from "./cart.controller";


const router = express.Router();


router.post("/", auth(), CartController.createCart);
router.delete("/:id", auth(), CartController.deleteCart);
router.get("/", auth(), CartController.getCart);

export const CartRoutes = router;