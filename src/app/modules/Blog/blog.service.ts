import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { IBlog } from "./blog.interface";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import getBlogStats from "../../../helpars/readBlogTime";

const createBlog = async (blogData: IBlog) => {

  return await prisma.blog.create({
    data: {
      title: blogData.title,
      category: blogData.category,
      content: blogData.content,
      published: blogData.published,
      banner: blogData.banner,
    }
  });
};

const updateBlog = async (id: string, blogData: Partial<IBlog>) => {

  const findBlog = await prisma.blog.findUnique({
    where: { id },
  });

  if(!findBlog){
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: blogData,
  });

  return blog;
};

const deleteBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if(!blog){
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  await prisma.blog.delete({
    where: { id },
  });
};

const getAllBlogs = async (  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions) => {

  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["title", "category"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.BlogWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const blogs = await prisma.blog.findMany({
    where: {
      ...whereConditions,
    },
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.blog.count({
    where: {
      ...whereConditions,
    },
  });

  const blogsWithStats = blogs.map((blog) => {
    const stats = getBlogStats(blog.content);
    return {
      ...blog,
      // wordCount: stats.wordCount,
      readingTime: stats.readingTime,
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: blogsWithStats,
  };
};

const getSingleBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if(!blog){
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return await prisma.blog.findUnique({
    where: { id },
  });
};

export const BlogService = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
};
