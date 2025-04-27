import prisma from "../../../shared/prisma";
import { IOrder } from "./order.interface";

const createOrder = async (orderData: IOrder) => {
 
};


const deleteOrder = async (id: string) => {
  return await prisma.order.delete({
    where: { id },
  });
};

const getAllOrders = async () => {
 
};

export const OrderService = {
  createOrder,
  deleteOrder,
  getAllOrders,
};
