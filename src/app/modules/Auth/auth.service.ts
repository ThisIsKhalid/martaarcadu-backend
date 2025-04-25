import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";

const refreshToken = async (refreshToken: string) => {
  const decodedToken = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refresh_token_secret as Secret
  );

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: decodedToken.email,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return { accessToken };
};

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(404, "User not found");
  }

  if (!payload.password || !userData?.password) {
    throw new ApiError(400, "Password is required");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(401, "Password is incorrect");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      isPartner: userData.isPartner,
      isPersonalClinicalIdentificationData:
        userData.isPersonalClinicalIdentificationData,
      isDigestiveHistoryBackgroundData:
        userData.isDigestiveHistoryBackgroundData,
      isDietSensitivitiesHabitsData: userData.isDietSensitivitiesHabitsData,
      isGoalMotivationConsentData: userData.isGoalMotivationConsentData,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

// get user profile
const getMyProfile = async (userToken: string) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const userProfile = await prisma.user.findUnique({
    where: {
      id: decodedToken?.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isAgreedToTermsCondition: true,
      isPersonalClinicalIdentificationData: true,
      isDigestiveHistoryBackgroundData: true,
      isDietSensitivitiesHabitsData: true,
      isGoalMotivationConsentData: true,

      isPartner: true,
      partner: true,
    },
  });

  if (!userProfile) {
    throw new ApiError(404, "User not found");
  }

  return userProfile;
};

export const AuthServices = {
  refreshToken,
  loginUser,
  getMyProfile,
};
