import { AppointmentStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { IAppointment } from "./appointment.interface";

const createAppointment = async (appointmentData: IAppointment) => {
  const partnerExists = await prisma.partner.findUnique({
    where: { id: appointmentData.partnerId },
  });

  if (!partnerExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  const patientExists = await prisma.user.findUnique({
    where: {
        id: appointmentData.patientId
    }
  })

  if(!patientExists){
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }



  const appointment = await prisma.appointment.create({
    data: {
      partnerId: appointmentData.partnerId,
      patientId: appointmentData.patientId,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
      status: AppointmentStatus.PENDING,
    },
  });

  if (!appointment) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create appointment");
  }

  return appointment;
};

export const AppointmentService = {
  createAppointment,
};
