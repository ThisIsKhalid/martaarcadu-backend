import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import getBlogStats from "../../../helpars/readBlogTime";
import { ICart } from "./cart.interface";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import config from "../../../config";


const createCart = async (userToken: string, cartData: ICart) => {
    const decodedToken = jwtHelpers.verifyToken(
        userToken,
        config.jwt.jwt_secret!
      );

    if (!decodedToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decodedToken.id,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    if(user.id !== cartData.userId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not authorized to create this cart");
    }

    const product= await prisma.product.findUnique({
        where: {
            id: cartData.productId,
        }
    })

    if(!product){
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

  return await prisma.cart.create({
    data: {
        userId: user.id,
        productId: cartData.productId
    },
  });
}


const deleteCart = async(userToken: string ,cartId: string) => {
    const decodedToken = jwtHelpers.verifyToken(
        userToken,
        config.jwt.jwt_secret!
      );

    if (!decodedToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    console.log(decodedToken.id)

    const user = await prisma.user.findUnique({
        where: {
            id: decodedToken.id,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    const cart = await prisma.cart.findUnique({
        where: {
            id: cartId,
        }
    })

    if(!cart){
        throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
    }

    await prisma.cart.delete({
        where: {
            id: cartId,
        }
    })
}


const getCart = async (userToken: string) => {
    const decodedToken = jwtHelpers.verifyToken(
        userToken,
        config.jwt.jwt_secret!
      );

    if (!decodedToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decodedToken.id,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    return await prisma.cart.findMany({
        where: {
            userId: user.id,
        }
    })
}


export const CartService = {
    createCart,
    deleteCart,
    getCart
}