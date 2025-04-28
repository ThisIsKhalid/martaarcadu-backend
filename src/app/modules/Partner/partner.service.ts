import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPartner } from "./partner.interface";

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

const getAllPartner = async () => {
  const partners = await prisma.partner.findMany();

  if (!partners) {
    throw new ApiError(httpStatus.NOT_FOUND, "No partners found");
  }

  return partners;
}

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
}


const updatePartner = async (id: string, payload: IPartner) => {
  const userExist = await prisma.partner.findUnique({
    where: {
      id,
    }
  });

  if (!userExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatePartner = await prisma.partner.update({
    where: {
      id
    },
    data: {
      profilePhoto: payload.profilePhoto,
      title: payload.title,
      pricePerConsultation: Number(payload.pricePerConsultation),
      availableDayStart: payload.availableDayStart,
      availableDayEnd: payload.availableDayEnd,
      availableTime: payload.availableTime,
      phoneNumber: payload.phoneNumber
    }
  })

  return updatePartner;
}

export const PartnerService = {
  createPartnerAcc,
  getAllPartner,
  getSinglePartner,
  updatePartner
};
