import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";

const registration = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.registration(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have registered successfully",
    data: result,
  });
});

export const UserController = {
  registration,
};
