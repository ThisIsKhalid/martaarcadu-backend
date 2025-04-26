import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TestReportService } from "./testReport.service";

const uploadTestReport = catchAsync(async (req: Request, res: Response) => {
  const { body, file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const data = {
    ...body,
    file: `${config.backend_image_url}/testReport/${file.filename}`,
    path: file.path,
  };

  const report = await TestReportService.uploadTestReport(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Test report created successfully",
    data: report,
  });
});

export const TestReportController = {
  uploadTestReport,
};
