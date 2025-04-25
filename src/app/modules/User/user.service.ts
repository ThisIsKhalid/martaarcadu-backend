import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { IUser } from "./user.interface";
import emailSender from "../../../helpars/emailSender/emailSender";

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

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.create({
    data: {
      userId: randomId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      isAgreedToTermsCondition: userData.isAgreedToTermsCondition ?? false,
      otp: randomOtp,
      otpExpiresAt: otpExpiry,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
        </div>
        <div style="padding: 20px 12px; text-align: center;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
            <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${randomOtp}</p>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  await emailSender("OTP", userData.email, html);

  // if (!newUser) {
  //   throw new ApiError(
  //     httpStatus.INTERNAL_SERVER_ERROR,
  //     "Failed to create user"
  //   );
  // }

  // const accessToken = jwtHelpers.generateToken(
  //   {
  //     id: newUser.id,
  //     email: newUser.email,
  //     role: newUser.role,
  //   },
  //   config.jwt.jwt_secret as Secret,
  //   config.jwt.expires_in as string
  // );

  // const refreshToken = jwtHelpers.generateToken(
  //   {
  //     id: newUser.id,
  //     email: newUser.email,
  //     role: newUser.role,
  //   },
  //   config.jwt.refresh_token_secret as Secret,
  //   config.jwt.refresh_token_expires_in as string
  // );

  // return {
  //   accessToken,
  //   refreshToken,
  // };
};

export const UserService = {
  registration,
};
