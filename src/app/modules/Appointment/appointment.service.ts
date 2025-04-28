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
    date?: string;
    status?: string
  },
  options: IPaginationOptions
) => {
  // Check if the partner exists
  const partner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  const { searchTerm, date, status } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions: any[] = [
    { partnerId: id }, 
  ];

  // Add search term filter
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

  if (status) {
    andConditions.push({
      status: status,
    });
  }

  // Add date filter (only if a date is provided)
  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    andConditions.push({
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Fetch the appointments
  const appointments = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" },
  });

  // Count total appointments
  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: appointments,
  };
};

const getPartientAppointment = async (
  id: string,
  filters: {
    searchTerm?: string;
    date?: string;
  },
  options: IPaginationOptions
) => {
  // Check if the partner exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  const { searchTerm, date } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions: any[] = [
    { patientId: id }, 
  ];

  // Add search term filter
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

  // Add date filter (only if a date is provided)
  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    andConditions.push({
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Fetch the appointments
  const appointments = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" },
  });

  // Count total appointments
  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: appointments,
  };
};


const updateStatus = async(id: string,  body: { status: AppointmentStatus }) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id
    }
  })

  if(!appointment){
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  const update = await prisma.appointment.update({
    where: {
      id
    },
    data:{
      status: body.status
    }
  })
}


export const AppointmentService = {
  createAppointment,
  getPartnarAppointment,
  getPartientAppointment,
  updateStatus
};
