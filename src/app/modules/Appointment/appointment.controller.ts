import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.createAppointment(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appintment created successfully",
        data: appointment,
      });
});


export const AppointmentController = {
    createAppointment
}