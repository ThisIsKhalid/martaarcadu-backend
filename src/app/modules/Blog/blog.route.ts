import express from "express";
import { BlogController } from "./blog.controller";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";

const router = express.Router();

const upload = multer({ storage: createStorage("blog") });

const fileUpload = upload.single("file");

router.post("/", fileUpload, BlogController.blogCreate);
router.patch("/:id", fileUpload, BlogController.blogUpdate);
router.delete("/:id", BlogController.blogDelete);
router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getSingleBlog);

export const BlogRoutes = router;
