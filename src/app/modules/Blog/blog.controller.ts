import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BlogService } from "./blog.service";

const blogCreate = catchAsync(async (req: Request, res: Response) => {
  const blog = await BlogService.createBlog(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

const blogUpdate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await BlogService.updateBlog(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});

const blogDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await BlogService.deleteBlog(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog deleted successfully",
    data: blog,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const blogs = await BlogService.getAllBlogs();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs retrieved successfully",
    data: blogs,
  });
});

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await BlogService.getSingleBlog(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog retrieved successfully",
    data: blog,
  });
});

export const BlogController = {
  blogCreate,
  blogUpdate,
  blogDelete,
  getAllBlogs,
  getSingleBlog,
};
