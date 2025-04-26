import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IProduct } from "./product.interface";

const createProduct = async (productData: IProduct) => {
  const { price, discount } = productData;
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

const getAllProducts = async () => {
  return await prisma.product.findMany();
};

const getSingleProduct = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};

export const ProductService = {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
};
