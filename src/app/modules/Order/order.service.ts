import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import stripe from "../../../helpars/stripe/stripe";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { PaymentService } from "../Payment/payment.service";
import { IOrder } from "./order.interface";

const createOrder = async (userId: string, orderData: IOrder) => {
  const isUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!isUser || !isUser?.stripeCustomerId) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const serialNumber = Math.random().toString(36).substring(2).toUpperCase();

  let totalprice = 0;
  await Promise.all(
    orderData.products.map(async (product) => {
      const productPrice = await prisma.product.findUnique({
        where: {
          id: product.productId,
        },
      });

      if (!productPrice) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
      }
      totalprice += productPrice?.discountedPrice
        ? productPrice.discountedPrice * product.quantity
        : productPrice?.price * product.quantity;

      // await prisma.cart.deleteMany({
      //   where: {
      //     userId: userId,
      //     productId: product.productId,
      //   },
      // });
    })
  );

  const deliveryFee = 0;
  const totalAmount = totalprice + deliveryFee;

  await stripe.paymentMethods.attach(orderData?.paymentMethodId, {
    customer: isUser?.stripeCustomerId,
  });

  const paymentIntent = await PaymentService.authorizePayment(
    isUser?.stripeCustomerId,
    orderData?.paymentMethodId,
    totalAmount
  );

  if (!paymentIntent.id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment failed, try again");
  }

  const order = await prisma.order.create({
    data: {
      userId,
      orderSN: serialNumber,
      products: JSON.stringify(orderData?.products),
      totalPrice: totalAmount,
      deliveryFee,
      mobileNumber: orderData?.mobileNumber,
      country: orderData?.country,
      address: orderData?.address,
      apartment: orderData?.apartment,
      city: orderData?.city,
      state: orderData?.state,
      zipCode: orderData?.zipCode,
      paymentMethodId: orderData?.paymentMethodId,
      paymentIntentId: paymentIntent.id,
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order creation failed");
  }

  return order;
};

const confirmOrder = async (orderId: string, status: boolean) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order || !order.paymentIntentId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const paymentIntent = await PaymentService.capturePayment(
    order?.paymentIntentId
  );

  if (paymentIntent.status !== "succeeded") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment capture failed");
  }

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      isConfirmed: status,
      paymentStatus: "COMPLETED",
    },
  });
};

const deleteOrder = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.isConfirmed) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot delete a confirmed order"
    );
  }

  return await prisma.order.delete({
    where: { id },
  });
};

const getAllOrders = async (options: IPaginationOptions) => {
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const orders = await prisma.order.findMany({
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.order.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: orders,
  };
};

const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

export const OrderService = {
  createOrder,
  confirmOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
};
