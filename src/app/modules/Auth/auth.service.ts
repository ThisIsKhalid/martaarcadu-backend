import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";

const verifyUserByOTP = async (id: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isPartner: user.isPartner,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

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

  if (userData?.isVerified === false) {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        otp: randomOtp,
        otpExpiresAt: otpExpiry,
      },
    });

    const html = otpEmail(randomOtp);

    await emailSender("OTP", userData.email, html);

    return {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
    };
  } else {
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
  }
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
      isVerified: true,
      isAgreedToTermsCondition: true,
      isPersonalClinicalIdentificationData: true,
      isDigestiveHistoryBackgroundData: true,
      isDietSensitivitiesHabitsData: true,
      isGoalMotivationConsentData: true,

      isPartner: true,
      partner: true,
      healthProfile: true,
    },
  });

  if (!userProfile) {
    throw new ApiError(404, "User not found");
  }

  return userProfile;
};

const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      otp: randomOtp,
      otpExpiresAt: otpExpiry,
    },
  });

  const html = otpEmail(randomOtp);

  await emailSender("OTP", user.email, html);
};

const resetPassword = async (email: string, otp: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }


  if (user.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiresAt: null,
    },
  });
};

export const AuthServices = {
  verifyUserByOTP,
  refreshToken,
  loginUser,
  getMyProfile,
  forgetPassword,
  resetPassword,
};
