import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  // expect req.body to include a productIds array
  const order = await OrderService.createOrder(user?.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

const confirmOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await OrderService.confirmOrder(orderId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order confirmed successfully",
    data: order,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await OrderService.deleteOrder(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order deleted successfully",
    data: order,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "date"]);
  const options = pick(req.query, paginationFields);

  const orders = await OrderService.getAllOrders(filters,options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: orders,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await OrderService.getOrderById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully",
    data: order,
  });
});

export const OrderController = {
  createOrder,
  confirmOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
};
