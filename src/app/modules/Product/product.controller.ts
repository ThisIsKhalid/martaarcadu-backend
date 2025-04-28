import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { ProductService } from "./product.service";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";

const productCreate = catchAsync(async (req: Request, res: Response) => {
  const { file, body } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product photo is required");
  }

  const data = {
    ...body,
    imageUrl: `${config.backend_image_url}/product/${file.filename}`,
  };



  const product = await ProductService.createProduct(data);
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


const updateVisibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {isVisible} = req.body;

  const product = await ProductService.updateVisibility(id, isVisible);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    data: product,
  });
});





export const ProductController = {
  productCreate,
  productDelete,
  getAllProducts,
  updateVisibility
};
