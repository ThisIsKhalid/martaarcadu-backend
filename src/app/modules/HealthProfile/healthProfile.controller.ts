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

const createGIHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await HealthProfileService.createGIHistory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have successfully created your GI history",
    data: result,
  });
});

const createNutritionProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await HealthProfileService.createNutritionProfile(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "You have successfully created your nutrition profile",
      data: result,
    });
  }
);

const createGoalsMotivation = catchAsync(
  async (req: Request, res: Response) => {
    const result = await HealthProfileService.createGoalsMotivation(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "You have successfully created your goals and motivation",
      data: result,
    });
  }
);

export const HealthProfileController = {
  createHealthProfile,
  createGIHistory,
  createNutritionProfile,
  createGoalsMotivation,
};
