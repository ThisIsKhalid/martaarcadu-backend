import prisma from "../../../shared/prisma";
import { IProduct } from "./product.interface";

const createProduct = async (productData: IProduct) => {
  return await prisma.product.create({
    data: productData,
  });
};

const updateProduct = async (id: string, productData: Partial<IProduct>) => {
  return await prisma.product.update({
    where: { id },
    data: productData,
  });
};

const deleteProduct = async (id: string) => {
  return await prisma.product.delete({
    where: { id },
  });
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
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
};
