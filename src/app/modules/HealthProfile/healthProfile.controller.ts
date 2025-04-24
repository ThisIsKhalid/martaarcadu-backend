import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { HealthProfileService } from "./healthProfile.service";

const createHealthProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await HealthProfileService.createHealthProfile(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have successfully created your health profile",
    data: result,
  });
});

export const HealthProfileController = {
  createHealthProfile,
};
