// only update use patch
// update or create use put
// only create use post

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { DIET_TYPE, IHealthProfile } from "./healthProfile.interface";

const createHealthProfile = async (payload: IHealthProfile) => {
  const isUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const { medications, ...healthProfileData } = payload;

  // Calculate BMI if height and weight are provided
  if (healthProfileData.height && healthProfileData.weight) {
    const heightInMeters = healthProfileData.height / 100;
    healthProfileData.bmi = parseFloat(
      (healthProfileData.weight / (heightInMeters * heightInMeters)).toFixed(1)
    );
  }

  // Create or update the health profile
  const healthProfile = await prisma.healthProfile.upsert({
    where: {
      userId: payload.userId,
    },
    update: {
      ...healthProfileData,
      medications: medications?.length
        ? {
            deleteMany: {}, // Remove existing medications
            create: medications.map((med) => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              startDate: med.startDate,
            })),
          }
        : undefined,
      giHistory: healthProfileData.pastIssues
        ? {
            upsert: {
              create: {
                pastIssues: healthProfileData.pastIssues,
                onsetDate: healthProfileData.onsetDate,
                treatmentReceived: healthProfileData.treatmentReceived,
                familyConditions: healthProfileData.familyConditions,
                otherRelevantConditions:
                  healthProfileData.otherRelevantConditions,
                relationshipDegree: healthProfileData.relationshipDegree,
                surgeryType: healthProfileData.surgeryType,
                surgeryOutcome: healthProfileData.surgeryOutcome,
                surgeryDate: healthProfileData.surgeryDate,
                bowelMovementFreq: healthProfileData.bowelMovementFreq,
                bristolStoolScale: healthProfileData.bristolStoolScale,
                bloating: healthProfileData.bloating,
                gas: healthProfileData.gas,
                abdominalPain: healthProfileData.abdominalPain,
                digestiveDifficulty: healthProfileData.digestiveDifficulty,
                diagonesedIntolerances:
                  healthProfileData.diagonesedIntolerances,
                certifiedAllergies: healthProfileData.certifiedAllergies,
                testsPerformed: healthProfileData.testsPerformed,
              },
              update: {
                pastIssues: healthProfileData.pastIssues,
                onsetDate: healthProfileData.onsetDate,
                treatmentReceived: healthProfileData.treatmentReceived,
                familyConditions: healthProfileData.familyConditions,
                otherRelevantConditions:
                  healthProfileData.otherRelevantConditions,
                relationshipDegree: healthProfileData.relationshipDegree,
                surgeryType: healthProfileData.surgeryType,
                surgeryOutcome: healthProfileData.surgeryOutcome,
                surgeryDate: healthProfileData.surgeryDate,
                bowelMovementFreq: healthProfileData.bowelMovementFreq,
                bristolStoolScale: healthProfileData.bristolStoolScale,
                bloating: healthProfileData.bloating,
                gas: healthProfileData.gas,
                abdominalPain: healthProfileData.abdominalPain,
                digestiveDifficulty: healthProfileData.digestiveDifficulty,
                diagonesedIntolerances:
                  healthProfileData.diagonesedIntolerances,
                certifiedAllergies: healthProfileData.certifiedAllergies,
                testsPerformed: healthProfileData.testsPerformed,
              },
            },
          }
        : undefined,
      nutritionProfile:
        healthProfileData.dietType || healthProfileData.vegetables !== undefined
          ? {
              upsert: {
                create: {
                  dietType: healthProfileData.dietType as DIET_TYPE | undefined,
                  otherDietType: healthProfileData.otherDietType,
                  vegetables: healthProfileData.vegetables,
                  animalProteins: healthProfileData.animalProteins,
                  fruits: healthProfileData.fruits,
                  plantProteins: healthProfileData.plantProteins,
                  wholeGrains: healthProfileData.wholeGrains,
                  dairyProducts: healthProfileData.dairyProducts,
                  water: healthProfileData.water,
                  alcohol: healthProfileData.alcohol,
                  breakfastTime: healthProfileData.breakfastTime,
                  lunchTime: healthProfileData.lunchTime,
                  dinnerTime: healthProfileData.dinnerTime,
                  snackTime: healthProfileData.snackTime,
                  physicalActivityType: healthProfileData.physicalActivityType,
                  physicalActivityFrequency:
                    healthProfileData.physicalActivityFrequency,
                  physicalActivityDuration:
                    healthProfileData.physicalActivityDuration,
                  sleepDuration: healthProfileData.sleepDuration,
                  sleepQuality: healthProfileData.sleepQuality,
                  specificSleepIssues: healthProfileData.specificSleepIssues,
                  stressLevel: healthProfileData.stressLevel,
                  smokingStatus: healthProfileData.smokingStatus,
                  smokingAmount: healthProfileData.smokingAmount,
                  antibioticsName: healthProfileData.antibioticsName,
                  isRecentlyOnAntibiotics:
                    healthProfileData.isRecentlyOnAntibiotics,
                  antibioticsEndDate: healthProfileData.antibioticsEndDate,
                  probioticsName: healthProfileData.probioticsName,
                  probioticsMinerals: healthProfileData.probioticsMinerals,
                  prebioticsName: healthProfileData.prebioticsName,
                  vitaminsName: healthProfileData.vitaminsName,
                  preventiveWellness: healthProfileData.preventiveWellness,
                  digestiveOptimization:
                    healthProfileData.digestiveOptimization,
                  weightManagement: healthProfileData.weightManagement,
                  sportsPerformance: healthProfileData.sportsPerformance,
                  stressBalance: healthProfileData.stressBalance,
                  postAntibioticRecovery:
                    healthProfileData.postAntibioticRecovery,
                  immuneSupport: healthProfileData.immuneSupport,
                  womensHealth: healthProfileData.womensHealth,
                  activeLongevity: healthProfileData.activeLongevity,
                  cardiovascularHealth: healthProfileData.cardiovascularHealth,
                  skinHealth: healthProfileData.skinHealth,
                  urineryTractWellness: healthProfileData.urineryTractWellness,
                  secondaryGoal: healthProfileData.secondaryGoal,
                  interventionPriorities:
                    healthProfileData.interventionPriorities,
                  dietary: healthProfileData.dietary,
                  supplementation: healthProfileData.supplementation,
                  potentialObstacles: healthProfileData.potentialObstacles,
                  supportNeeded: healthProfileData.supportNeeded,
                  notes: healthProfileData.notes,
                  isAuthorizeProcessingPersonalData:
                    healthProfileData.isAuthorizeProcessingPersonalData,
                  isConsentPersonalizedService:
                    healthProfileData.isConsentPersonalizedService,
                  isAcceptTermsAndConditions:
                    healthProfileData.isAcceptTermsAndConditions,
                },
                update: {
                  dietType: healthProfileData.dietType as DIET_TYPE | undefined,
                  otherDietType: healthProfileData.otherDietType,
                  vegetables: healthProfileData.vegetables,
                  animalProteins: healthProfileData.animalProteins,
                  fruits: healthProfileData.fruits,
                  plantProteins: healthProfileData.plantProteins,
                  wholeGrains: healthProfileData.wholeGrains,
                  dairyProducts: healthProfileData.dairyProducts,
                  water: healthProfileData.water,
                  alcohol: healthProfileData.alcohol,
                  breakfastTime: healthProfileData.breakfastTime,
                  lunchTime: healthProfileData.lunchTime,
                  dinnerTime: healthProfileData.dinnerTime,
                  snackTime: healthProfileData.snackTime,
                  physicalActivityType: healthProfileData.physicalActivityType,
                  physicalActivityFrequency:
                    healthProfileData.physicalActivityFrequency,
                  physicalActivityDuration:
                    healthProfileData.physicalActivityDuration,
                  sleepDuration: healthProfileData.sleepDuration,
                  sleepQuality: healthProfileData.sleepQuality,
                  specificSleepIssues: healthProfileData.specificSleepIssues,
                  stressLevel: healthProfileData.stressLevel,
                  smokingStatus: healthProfileData.smokingStatus,
                  smokingAmount: healthProfileData.smokingAmount,
                  antibioticsName: healthProfileData.antibioticsName,
                  isRecentlyOnAntibiotics:
                    healthProfileData.isRecentlyOnAntibiotics,
                  antibioticsEndDate: healthProfileData.antibioticsEndDate,
                  probioticsName: healthProfileData.probioticsName,
                  probioticsMinerals: healthProfileData.probioticsMinerals,
                  prebioticsName: healthProfileData.prebioticsName,
                  vitaminsName: healthProfileData.vitaminsName,
                  preventiveWellness: healthProfileData.preventiveWellness,
                  digestiveOptimization:
                    healthProfileData.digestiveOptimization,
                  weightManagement: healthProfileData.weightManagement,
                  sportsPerformance: healthProfileData.sportsPerformance,
                  stressBalance: healthProfileData.stressBalance,
                  postAntibioticRecovery:
                    healthProfileData.postAntibioticRecovery,
                  immuneSupport: healthProfileData.immuneSupport,
                  womensHealth: healthProfileData.womensHealth,
                  activeLongevity: healthProfileData.activeLongevity,
                  cardiovascularHealth: healthProfileData.cardiovascularHealth,
                  skinHealth: healthProfileData.skinHealth,
                  urineryTractWellness: healthProfileData.urineryTractWellness,
                  secondaryGoal: healthProfileData.secondaryGoal,
                  interventionPriorities:
                    healthProfileData.interventionPriorities,
                  dietary: healthProfileData.dietary,
                  supplementation: healthProfileData.supplementation,
                  potentialObstacles: healthProfileData.potentialObstacles,
                  supportNeeded: healthProfileData.supportNeeded,
                  notes: healthProfileData.notes,
                  isAuthorizeProcessingPersonalData:
                    healthProfileData.isAuthorizeProcessingPersonalData,
                  isConsentPersonalizedService:
                    healthProfileData.isConsentPersonalizedService,
                  isAcceptTermsAndConditions:
                    healthProfileData.isAcceptTermsAndConditions,
                },
              },
            }
          : undefined,
    },
    create: {
      ...healthProfileData,
      medications: medications?.length
        ? {
            create: medications.map((med) => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              startDate: med.startDate,
            })),
          }
        : undefined,
      giHistory: healthProfileData.pastIssues
        ? {
            create: {
              pastIssues: healthProfileData.pastIssues,
              onsetDate: healthProfileData.onsetDate,
              treatmentReceived: healthProfileData.treatmentReceived,
              familyConditions: healthProfileData.familyConditions,
              otherRelevantConditions:
                healthProfileData.otherRelevantConditions,
              relationshipDegree: healthProfileData.relationshipDegree,
              surgeryType: healthProfileData.surgeryType,
              surgeryOutcome: healthProfileData.surgeryOutcome,
              surgeryDate: healthProfileData.surgeryDate,
              bowelMovementFreq: healthProfileData.bowelMovementFreq,
              bristolStoolScale: healthProfileData.bristolStoolScale,
              bloating: healthProfileData.bloating,
              gas: healthProfileData.gas,
              abdominalPain: healthProfileData.abdominalPain,
              digestiveDifficulty: healthProfileData.digestiveDifficulty,
              diagonesedIntolerances: healthProfileData.diagonesedIntolerances,
              certifiedAllergies: healthProfileData.certifiedAllergies,
              testsPerformed: healthProfileData.testsPerformed,
            },
          }
        : undefined,
      nutritionProfile:
        healthProfileData.dietType || healthProfileData.vegetables !== undefined
          ? {
              create: {
                dietType: healthProfileData.dietType as DIET_TYPE | undefined,
                otherDietType: healthProfileData.otherDietType,
                vegetables: healthProfileData.vegetables,
                animalProteins: healthProfileData.animalProteins,
                fruits: healthProfileData.fruits,
                plantProteins: healthProfileData.plantProteins,
                wholeGrains: healthProfileData.wholeGrains,
                dairyProducts: healthProfileData.dairyProducts,
                water: healthProfileData.water,
                alcohol: healthProfileData.alcohol,
                breakfastTime: healthProfileData.breakfastTime,
                lunchTime: healthProfileData.lunchTime,
                dinnerTime: healthProfileData.dinnerTime,
                snackTime: healthProfileData.snackTime,
                physicalActivityType: healthProfileData.physicalActivityType,
                physicalActivityFrequency:
                  healthProfileData.physicalActivityFrequency,
                physicalActivityDuration:
                  healthProfileData.physicalActivityDuration,
                sleepDuration: healthProfileData.sleepDuration,
                sleepQuality: healthProfileData.sleepQuality,
                specificSleepIssues: healthProfileData.specificSleepIssues,
                stressLevel: healthProfileData.stressLevel,
                smokingStatus: healthProfileData.smokingStatus,
                smokingAmount: healthProfileData.smokingAmount,
                antibioticsName: healthProfileData.antibioticsName,
                isRecentlyOnAntibiotics:
                  healthProfileData.isRecentlyOnAntibiotics,
                antibioticsEndDate: healthProfileData.antibioticsEndDate,
                probioticsName: healthProfileData.probioticsName,
                probioticsMinerals: healthProfileData.probioticsMinerals,
                prebioticsName: healthProfileData.prebioticsName,
                vitaminsName: healthProfileData.vitaminsName,
                preventiveWellness: healthProfileData.preventiveWellness,
                digestiveOptimization: healthProfileData.digestiveOptimization,
                weightManagement: healthProfileData.weightManagement,
                sportsPerformance: healthProfileData.sportsPerformance,
                stressBalance: healthProfileData.stressBalance,
                postAntibioticRecovery:
                  healthProfileData.postAntibioticRecovery,
                immuneSupport: healthProfileData.immuneSupport,
                womensHealth: healthProfileData.womensHealth,
                activeLongevity: healthProfileData.activeLongevity,
                cardiovascularHealth: healthProfileData.cardiovascularHealth,
                skinHealth: healthProfileData.skinHealth,
                urineryTractWellness: healthProfileData.urineryTractWellness,
                secondaryGoal: healthProfileData.secondaryGoal,
                interventionPriorities:
                  healthProfileData.interventionPriorities,
                dietary: healthProfileData.dietary,
                supplementation: healthProfileData.supplementation,
                potentialObstacles: healthProfileData.potentialObstacles,
                supportNeeded: healthProfileData.supportNeeded,
                notes: healthProfileData.notes,
                isAuthorizeProcessingPersonalData:
                  healthProfileData.isAuthorizeProcessingPersonalData,
                isConsentPersonalizedService:
                  healthProfileData.isConsentPersonalizedService,
                isAcceptTermsAndConditions:
                  healthProfileData.isAcceptTermsAndConditions,
              },
            }
          : undefined,
    },
    include: {
      medications: true,
      giHistory: true,
      nutritionProfile: true,
    },
  });

  return healthProfile;
};

export const HealthProfileService = {
  createHealthProfile,
};
