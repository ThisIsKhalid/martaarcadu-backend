import express from "express";
import { BlogController } from "./blog.controller";

const router = express.Router();

router.post("/", BlogController.blogCreate);
router.put("/:id", BlogController.blogUpdate);
router.delete("/:id", BlogController.blogDelete);
router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getSingleBlog);

export const BlogRoutes = router;
