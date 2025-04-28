import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.createAppointment(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appintment created successfully",
        data: appointment,
      });
});


const partnarAppointment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const filters = pick(req.query, ["searchTerm", "date", "status"]);
    const options = pick(req.query, paginationFields);

    const appointment = await AppointmentService.getPartnarAppointment(id, filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Partner appintment successfully",
        data: appointment,
      });
});


const patientAppointment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const filters = pick(req.query, ["searchTerm", "date"]);
    const options = pick(req.query, paginationFields);

    const appointment = await AppointmentService.getPartientAppointment(id, filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient appintment successfully",
        data: appointment,
      });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const appointment = await AppointmentService.updateStatus(id, req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Update appintment successfully",
        data: appointment,
      });
})


const partnerAppintmentHistory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const appointment = await AppointmentService.partnerAppintmentHistory(id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Retrive partner appintment successfully",
        data: appointment,
      });
})


export const AppointmentController = {
    createAppointment,
    partnarAppointment,
    patientAppointment,
    updateStatus,
    partnerAppintmentHistory
}