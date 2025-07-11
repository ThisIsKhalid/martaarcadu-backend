import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import { paginationFields } from "../../../constants/pagination";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { UtilsService } from "./utils.service";

const getAdminDashboardData = catchAsync(
  async (req: Request, res: Response) => {
    const { month, year } = req.params;

    const result = await UtilsService.getAdminDashboardData({
      month: Number(month),
      year: Number(year),
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result,
    });
  }
);

export const UtilsController = {
  getAdminDashboardData,
};
