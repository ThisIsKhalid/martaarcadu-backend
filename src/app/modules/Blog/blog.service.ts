import prisma from "../../../shared/prisma";
import { IBlog } from "./blog.interface";

const createBlog = async (blogData: IBlog) => {
  return await prisma.blog.create({
    data: blogData,
  });
};

const updateBlog = async (id: string, blogData: Partial<IBlog>) => {
  return await prisma.blog.update({
    where: { id },
    data: blogData,
  });
};

const deleteBlog = async (id: string) => {
  return await prisma.blog.delete({
    where: { id },
  });
};

const getAllBlogs = async () => {
  return await prisma.blog.findMany();
};

const getSingleBlog = async (id: string) => {
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
