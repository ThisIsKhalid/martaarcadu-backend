import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPartner } from "./partner.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";

const createPartnerAcc = async (payload: IPartner) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    include: {
      partner: true,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (isUserExist?.partner) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Partner account already exists"
    );
  }

  const result = await prisma.$transaction(async (TX) => {
    const partnerAcc = await TX.partner.create({
      data: {
        profilePhoto: payload.profilePhoto,
        title: payload.title,
        pricePerConsultation: Number(payload.pricePerConsultation),
        availableDayStart: payload.availableDayStart,
        availableDayEnd: payload.availableDayEnd,
        availableTime: payload.availableTime,
        userId: isUserExist.id,
      },
    });

    if (!partnerAcc) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to create partner account"
      );
    }

    await TX.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        isPartner: true,
      },
    });

    return partnerAcc;
  });

  return result;
};

const getAllPartner = async (
  filters: {
    searchTerm?: string;
    date?: string;
  },
  options: IPaginationOptions
) => {
  const partners = await prisma.partner.findMany();

  if (!partners) {
    throw new ApiError(httpStatus.NOT_FOUND, "No partners found");
  }

  const { searchTerm, date } = filters;

  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["title", "phoneNumber"].map((field) => ({
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

  const whereConditions: Prisma.PartnerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const partner = await prisma.partner.findMany({
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

  const total = await prisma.partner.count({
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
    data: partner,
  };
};

const getSinglePartner = async (id: string) => {
  const partner = await prisma.partner.findUnique({
    where: {
      id,
    },
  });

  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return partner;
};

const updatePartner = async (id: string, payload: IPartner) => {
  const userExist = await prisma.partner.findUnique({
    where: {
      id,
    },
  });

  if (!userExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatePartner = await prisma.partner.update({
    where: {
      id,
    },
    data: {
      profilePhoto: payload.profilePhoto,
      title: payload.title,
      pricePerConsultation: Number(payload.pricePerConsultation),
      availableDayStart: payload.availableDayStart,
      availableDayEnd: payload.availableDayEnd,
      availableTime: payload.availableTime,
      phoneNumber: payload.phoneNumber,
    },
  });

  return updatePartner;
};

const updateVisibility = async (id: string, isVisible: boolean) => {
  const product = await prisma.partner.findUnique({
    where: { id },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  const updatedProduct = await prisma.partner.update({
    where: { id },
    data: { isVisible },
  });

  return updatedProduct;
};


const deletePartner = async(id: string) => {
  const partner = await prisma.partner.findUnique({
    where: {
      id
    }
  })

  if(!partner){
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  await prisma.partner.delete({
    where: {
      id
    }
  })
}

export const PartnerService = {
  createPartnerAcc,
  getAllPartner,
  getSinglePartner,
  updatePartner,
  updateVisibility,
  deletePartner
};
