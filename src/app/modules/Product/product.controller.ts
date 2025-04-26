import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { ProductService } from "./product.service";

const productCreate = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const productDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await ProductService.deleteProduct(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: product,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const products = await ProductService.getAllProducts(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    meta: products.meta,
    data: products.data,
  });
});


export const ProductController = {
  productCreate,
  productDelete,
  getAllProducts,
};
