import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IOrder } from "./order.interface";

const createOrder = async (userId : string, orderData: IOrder) => {
  const isUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

};

const deleteOrder = async (id: string) => {
  return await prisma.order.delete({
    where: { id },
  });
};

const getAllOrders = async () => {};

export const OrderService = {
  createOrder,
  deleteOrder,
  getAllOrders,
};
