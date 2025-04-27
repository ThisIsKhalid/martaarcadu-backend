import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { IProduct } from "./product.interface";

const createProduct = async (productData: IProduct) => {
  const price = Number(productData.price);
  const discount = Number(productData.discount);
  
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  const product = await prisma.product.create({
    data: {
      name: productData.name,
      price: price,
      discountedPrice: discountedPrice,
      discount: discount,
      category: productData.category,
      description: productData.description,
      imageUrl: productData.imageUrl,
    },
  });

  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create product");
  }

  return product;
};

const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  if (product.totalSell > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete product with sales history"
    );
  }

  await prisma.product.delete({
    where: { id },
  });

  return {
    message: "Product deleted successfully",
  };
};

const getAllProducts = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "category"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const product = await prisma.product.findMany({
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

  const total = await prisma.product.count({
    where: {
      ...whereConditions,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: product,
  };
};

const updateVisibility = async (id: string, isVisible: boolean) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: { isVisible },
  });

  return updatedProduct;
};


export const ProductService = {
  createProduct,
  deleteProduct,
  getAllProducts,
};
