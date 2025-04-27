import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { CartService } from "./cart.service";

const createCart = catchAsync(async (req: Request, res: Response) => {
    const userToken = req.headers.authorization;

    const cart = await CartService.createCart(userToken as string, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Cart created successfully",
        data: cart,
    });
})


const deleteCart = catchAsync(async (req: Request, res: Response) => {
    const userToken = req.headers.authorization;
    const cartId = req.params.id;

    const cart = await CartService.deleteCart(userToken as string, cartId);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Cart deleted successfully",
        data: cart,
    });
})


const getCart = catchAsync(async (req: Request, res: Response) => {
    const userToken = req.headers.authorization;

    const cart = await CartService.getCart(userToken as string);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Cart deleted successfully",
        data: cart,
    });
})

export const CartController = {
    createCart,
    deleteCart,
    getCart
}