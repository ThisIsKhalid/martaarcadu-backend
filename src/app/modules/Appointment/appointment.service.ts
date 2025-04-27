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
      id: appointmentData.patientId,
    },
  });

  if (!patientExists) {
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

const getPartnarAppointment = async (
  id: string,
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions
) => {

  const partner = await prisma.partner.findUnique({
    where: {
      id,
    },
  });

  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }


  const patient = await prisma.user.findUnique({
    where: {
      id
    }
  })

  if(!patient){
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["partnerId", "patientId", "status", "timeSlot"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const product = await prisma.product.findMany({
    where: {
      ...whereConditions,
    },
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.product.count({
    where: {
      ...whereConditions,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: product,
  };
};

export const AppointmentService = {
  createAppointment,
  getPartnarAppointment,
};
