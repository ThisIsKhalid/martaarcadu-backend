import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import stripe from "../../../helpars/stripe/stripe";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { PaymentService } from "../Payment/payment.service";
import { IOrder } from "./order.interface";
import { Prisma } from "@prisma/client";

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

const getAllOrders = async (  filters: {
  searchTerm?: string;
  date?: string;
},
options: IPaginationOptions) => {
  const { searchTerm, date } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["country", "address", "city"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

    // Add date filter (only if a date is provided)
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
      andConditions.push({
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const order = await prisma.order.findMany({
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

  const total = await prisma.order.count({
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
    data: order,
  };
};

// const getOrderById = async (id: string) => {
//   const order = await prisma.order.findUnique({
//     where: { id },
//   });

//   if (!order) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
//   }

//   return order;
// };

export const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

  // Make sure you have an actual array here:
  const itemsRaw = order.products;
  const items: { productId: string; quantity: number }[] =
    typeof itemsRaw === 'string'
      ? JSON.parse(itemsRaw)
      : (itemsRaw as any[]);

  // Now items.map will work:
  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) } },
  });

  const product =  items.map(({ productId, quantity }) => {
    const prod = products.find(p => p.id === productId)!;
    return { ...prod, quantity };
  });

  return {
    order,
    product
  }
};



export const OrderService = {
  createOrder,
  confirmOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
};
