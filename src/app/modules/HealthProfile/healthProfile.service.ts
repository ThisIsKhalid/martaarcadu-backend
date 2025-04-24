// only update use patch
// update or create use put
// only create use post

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { DIET_TYPE, IHealthProfile } from "./healthProfile.interface";

const createHealthProfile = async (payload: IHealthProfile) => {
  const result = await prisma.$transaction(async (TX) => {
    // ---------------------------------------
    const isUser = await TX.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!isUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // ---------------------------------------
    const { medications, ...healthData } = payload;

    // Calculate BMI if height and weight are provided
    if (healthData.height && healthData.weight) {
      const heightInMeters = healthData.height / 100;
      healthData.bmi = parseFloat(
        (healthData.weight / (heightInMeters * heightInMeters)).toFixed(1)
      );
    }

    // --------------------------------
    const healthProfile = await TX.healthProfile.upsert({
      where: {
        userId: payload.userId,
      },
      update: {
        height: healthData.height,
        weight: healthData.weight,
        bmi: healthData.bmi,
        primaryDiagnosis: healthData.primaryDiagnosis,
        diagnosisDate: healthData.diagnosisDate,
      },
      create: {
        userId: payload.userId,
        height: healthData.height,
        weight: healthData.weight,
        bmi: healthData.bmi,
        primaryDiagnosis: healthData.primaryDiagnosis,
        diagnosisDate: healthData.diagnosisDate,
      },
      include: {
        medications: true,
      },
    });

    if (!healthProfile) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to create health profile"
      );
    }

    // --------------------------------
    if (medications && medications.length > 0) {
      try {
        // Delete existing medications for this health profile
        await TX.medication.deleteMany({
          where: {
            profileId: healthProfile.id,
          },
        });

        // Create new medication records
        await TX.medication.createMany({
          data: medications.map((medication) => ({
            profileId: healthProfile.id,
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            startDate: medication.startDate || undefined,
          })),
        });

        await TX.user.update({
          where: {
            id: payload?.userId,
          },
          data: {
            isPersonalClinicalIdentificationData: true,
          },
        });
      } catch (error) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Error while processing medications"
        );
      }
    }

    return healthProfile;
  });

  return result;
};

export const HealthProfileService = {
  createHealthProfile,
};
