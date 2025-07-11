import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BlogService } from "./blog.service";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import { IBlog } from "./blog.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";

const blogCreate = catchAsync(async (req: Request, res: Response) => {

  const { body, file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }


  const blogData: IBlog = {
    title: body.title,
    category: body.category,
    content: body.content,
    published: body.published,
    banner: `${config.backend_image_url}/blog/${file.filename}`
  };


  const blog = await BlogService.createBlog(blogData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

const blogUpdate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { file } = req;

  if (file) {
    req.body.banner = `${config.backend_image_url}/blog/${file.filename}`;
  }

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
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const blogs = await BlogService.getAllBlogs(filters, options);
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


const updateVisibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {isVisible} = req.body;

  const product = await BlogService.updateVisibility(id, isVisible);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    data: product,
  });
});

export const BlogController = {
  blogCreate,
  blogUpdate,
  blogDelete,
  getAllBlogs,
  getSingleBlog,
  updateVisibility
};
