import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { IUser } from "./user.interface";

const registration = async (userData: IUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: userData?.email,
    },
  });

  if (isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword: string = await bcrypt.hash(userData?.password, 12);

  const randomId = `${userData.firstName.charAt(0)}${userData.lastName.charAt(
    0
  )}${Math.floor(Math.random() * 100000000)}`;

  const newUser = await prisma.user.create({
    data: {
      userId: randomId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      isAgreedToTermsCondition: userData.isAgreedToTermsCondition ?? false,
    },
  });

  if (!newUser) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create user"
    );
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const UserService = {
  registration,
};
