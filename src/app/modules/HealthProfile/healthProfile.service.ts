// only update use patch
// update or create use put
// only create use post

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  DIET_TYPE,
  IGIHistory,
  IGoalsMotivation,
  IHealthProfile,
  INutritionProfile,
} from "./healthProfile.interface";

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

const createGIHistory = async (payload: IGIHistory) => {
  const result = await prisma.$transaction(async (TX) => {
    // ---------------------------------------
    const isHealthProfile = await TX.healthProfile.findUnique({
      where: {
        id: payload.profileId,
      },
      include: {
        user: true,
      },
    });

    if (!isHealthProfile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Health Profile not found");
    }

    // ---------------------------------------
    const giHistoryData = await TX.gIHistory.upsert({
      where: {
        profileId: payload.profileId,
      },
      update: {
        pastIssues: payload.pastIssues,
        onsetDate: payload.onsetDate,
        treatmentReceived: payload.treatmentReceived,
        familyConditions: payload.familyConditions,
        otherRelevantConditions: payload.otherRelevantConditions,
        relationshipDegree: payload.relationshipDegree,
        surgeryType: payload.surgeryType,
        surgeryOutcome: payload.surgeryOutcome,
        surgeryDate: payload.surgeryDate,
        bowelMovementFreq: payload.bowelMovementFreq,
        bristolStoolScale: payload.bristolStoolScale,
        bloating: payload.bloating,
        gas: payload.gas,
        abdominalPain: payload.abdominalPain,
        digestiveDifficulty: payload.digestiveDifficulty,
        diagonesedIntolerances: payload.diagonesedIntolerances,
        certifiedAllergies: payload.certifiedAllergies,
        testsPerformed: payload.testsPerformed,
      },
      create: {
        profileId: payload.profileId,
        pastIssues: payload.pastIssues,
        onsetDate: payload.onsetDate,
        treatmentReceived: payload.treatmentReceived,
        familyConditions: payload.familyConditions,
        otherRelevantConditions: payload.otherRelevantConditions,
        relationshipDegree: payload.relationshipDegree,
        surgeryType: payload.surgeryType,
        surgeryOutcome: payload.surgeryOutcome,
        surgeryDate: payload.surgeryDate,
        bowelMovementFreq: payload.bowelMovementFreq,
        bristolStoolScale: payload.bristolStoolScale,
        bloating: payload.bloating,
        gas: payload.gas,
        abdominalPain: payload.abdominalPain,
        digestiveDifficulty: payload.digestiveDifficulty,
        diagonesedIntolerances: payload.diagonesedIntolerances,
        certifiedAllergies: payload.certifiedAllergies,
        testsPerformed: payload.testsPerformed,
      },
    });

    await TX.user.update({
      where: {
        id: isHealthProfile.user.id,
      },
      data: {
        isDigestiveHistoryBackgroundData: true,
      },
    });

    return giHistoryData;
  });

  return result;
};

const createNutritionProfile = async (payload: INutritionProfile) => {
  const result = await prisma.$transaction(async (TX) => {
    // ---------------------------------------
    const isHealthProfile = await TX.healthProfile.findUnique({
      where: {
        id: payload.profileId,
      },
      include: {
        user: true,
      },
    });

    if (!isHealthProfile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Health Profile not found");
    }

    // ---------------------------------------
    const nutritionProfileData = await TX.nutritionProfile.upsert({
      where: {
        profileId: payload.profileId,
      },
      update: {
        dietType: payload.dietType,
        otherDietType: payload.otherDietType,
        vegetables: payload.vegetables,
        animalProteins: payload.animalProteins,
        fruits: payload.fruits,
        plantProteins: payload.plantProteins,
        wholeGrains: payload.wholeGrains,
        dairyProducts: payload.dairyProducts,
        water: payload.water,
        alcohol: payload.alcohol,
        breakfastTime: payload.breakfastTime,
        lunchTime: payload.lunchTime,
        dinnerTime: payload.dinnerTime,
        snackTime: payload.snackTime,
        physicalActivityType: payload.physicalActivityType,
        physicalActivityDuration: payload.physicalActivityDuration,
        physicalActivityFrequency: payload.physicalActivityFrequency,
        sleepDuration: payload.sleepDuration,
        sleepQuality: payload.sleepQuality,
        specificSleepIssues: payload.specificSleepIssues,
        stressLevel: payload.stressLevel,
        smokingStatus: payload.smokingStatus,
        smokingAmount: payload.smokingAmount,
        antibioticsName: payload.antibioticsName,
        isRecentlyOnAntibiotics: payload.isRecentlyOnAntibiotics,
        antibioticsEndDate: payload.antibioticsEndDate,
        probioticsName: payload.probioticsName,
        probioticsMinerals: payload.probioticsMinerals,
        prebioticsName: payload.prebioticsName,
        vitaminsName: payload.vitaminsName,
        otherSupplements: payload.otherSupplements,
      },
      create: {
        profileId: payload.profileId,
        dietType: payload.dietType,
        otherDietType: payload.otherDietType,
        vegetables: payload.vegetables,
        animalProteins: payload.animalProteins,
        fruits: payload.fruits,
        plantProteins: payload.plantProteins,
        wholeGrains: payload.wholeGrains,
        dairyProducts: payload.dairyProducts,
        water: payload.water,
        alcohol: payload.alcohol,
        breakfastTime: payload.breakfastTime,
        lunchTime: payload.lunchTime,
        dinnerTime: payload.dinnerTime,
        snackTime: payload.snackTime,
        physicalActivityType: payload.physicalActivityType,
        physicalActivityDuration: payload.physicalActivityDuration,
        physicalActivityFrequency: payload.physicalActivityFrequency,
        sleepDuration: payload.sleepDuration,
        sleepQuality: payload.sleepQuality,
        specificSleepIssues: payload.specificSleepIssues,
        stressLevel: payload.stressLevel,
        smokingStatus: payload.smokingStatus,
        smokingAmount: payload.smokingAmount,
        antibioticsName: payload.antibioticsName,
        isRecentlyOnAntibiotics: payload.isRecentlyOnAntibiotics,
        antibioticsEndDate: payload.antibioticsEndDate,
        probioticsName: payload.probioticsName,
        probioticsMinerals: payload.probioticsMinerals,
        prebioticsName: payload.prebioticsName,
        vitaminsName: payload.vitaminsName,
        otherSupplements: payload.otherSupplements,
      },
    });

    await prisma.user.update({
      where: {
        id: isHealthProfile.user.id,
      },
      data: {
        isDietSensitivitiesHabitsData: true,
      },
    });

    return nutritionProfileData;
  });

  return result;
};

const createGoalsMotivation = async (payload: IGoalsMotivation) => {
  const result = await prisma.$transaction(async (TX) => {
    // ---------------------------------------
    const isHealthProfile = await TX.healthProfile.findUnique({
      where: {
        id: payload.profileId,
      },
      include: {
        user: true,
      },
    });

    if (!isHealthProfile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Health Profile not found");
    }

    // ---------------------------------------
    const goalsMotivationData = await TX.goalsMotivation.upsert({
      where: {
        profileId: payload.profileId,
      },
      update: {
        preventiveWellness: payload.preventiveWellness,
        digestiveOptimization: payload.digestiveOptimization,
        weightManagement: payload.weightManagement,
        sportsPerformance: payload.sportsPerformance,
        stressBalance: payload.stressBalance,
        postAntibioticRecovery: payload.postAntibioticRecovery,
        immuneSupport: payload.immuneSupport,
        womensHealth: payload.womensHealth,
        activeLongevity: payload.activeLongevity,
        cardiovascularHealth: payload.cardiovascularHealth,
        skinHealth: payload.skinHealth,
        urineryTractWellness: payload.urineryTractWellness,
        secondaryGoal: payload.secondaryGoal,
        interventionPriorities: payload.interventionPriorities,
        dietary: payload.dietary,
        supplementation: payload.supplementation,
        potentialObstacles: payload.potentialObstacles,
        supportNeeded: payload.supportNeeded,
        notes: payload.notes,
        isAuthorizeProcessingPersonalData:
          payload.isAuthorizeProcessingPersonalData,
        isConsentPersonalizedService: payload.isConsentPersonalizedService,
        isAcceptTermsAndConditions: payload.isAcceptTermsAndConditions,
      },
      create: {
        profileId: payload.profileId,
        preventiveWellness: payload.preventiveWellness,
        digestiveOptimization: payload.digestiveOptimization,
        weightManagement: payload.weightManagement,
        sportsPerformance: payload.sportsPerformance,
        stressBalance: payload.stressBalance,
        postAntibioticRecovery: payload.postAntibioticRecovery,
        immuneSupport: payload.immuneSupport,
        womensHealth: payload.womensHealth,
        activeLongevity: payload.activeLongevity,
        cardiovascularHealth: payload.cardiovascularHealth,
        skinHealth: payload.skinHealth,
        urineryTractWellness: payload.urineryTractWellness,
        secondaryGoal: payload.secondaryGoal,
        interventionPriorities: payload.interventionPriorities,
        dietary: payload.dietary,
        supplementation: payload.supplementation,
        potentialObstacles: payload.potentialObstacles,
        supportNeeded: payload.supportNeeded,
        notes: payload.notes,
        isAuthorizeProcessingPersonalData:
          payload.isAuthorizeProcessingPersonalData,
        isConsentPersonalizedService: payload.isConsentPersonalizedService,
        isAcceptTermsAndConditions: payload.isAcceptTermsAndConditions,
      },
    });

    await TX.user.update({
      where: {
        id: isHealthProfile.user.id,
      },
      data: {
        isGoalMotivationConsentData: true,
      },
    });

    return goalsMotivationData;
  });

  return result;
};

// -------------------------------------
const getHealthProfile = async (userId: string) => {
  const healthProfile = await prisma.healthProfile.findUnique({
    where: {
      userId,
    },
    include: {
      medications: true,
      giHistory: true,
      nutritionProfile: true,
      goalsMotivation: true,
    },
  });

  if (!healthProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Health Profile not found");
  }

  return healthProfile;
};

export const HealthProfileService = {
  createHealthProfile,
  createGIHistory,
  createNutritionProfile,
  createGoalsMotivation,

  // -------------------------------------
  getHealthProfile,
};
