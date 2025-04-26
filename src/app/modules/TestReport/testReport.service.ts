import { DIET_TYPE } from "@prisma/client";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import httpStatus from "http-status";
import path from "path";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IUploadTestReport } from "./testReport.interface";

const uploadTestReport = async (data: IUploadTestReport) => {
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
    include: {
      healthProfile: {
        include: {
          medications: true,
          giHistory: true,
          nutritionProfile: true,
          goalsMotivation: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    !user.healthProfile ||
    !user.healthProfile.medications ||
    !user.healthProfile.giHistory ||
    !user.healthProfile.nutritionProfile ||
    !user.healthProfile.goalsMotivation
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User health profile is incomplete"
    );
  }

  const { healthProfile } = user;
  const { medications, giHistory, nutritionProfile, goalsMotivation } =
    healthProfile;

  // Validate input
  if (!data || !data.file) {
    throw new Error("Invalid input: 'file' is required.");
  }

  let filePath;
  if (path.isAbsolute(data.path)) {
    filePath = data.path;
  } else {
    filePath = path.resolve(
      __dirname,
      "../../../../uploads/testReport",
      data.path
    );
  }

  let fileBuffer;
  let fileName;
  try {
    fileBuffer = await fs.promises.readFile(filePath);
    fileName = path.basename(filePath);
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }

  // ----------------------------------------
  const formData = new FormData();
  formData.append("file", fileBuffer, {
    filename: fileName,
    contentType: "application/pdf",
  });

  // Helper functions to convert values based on expected types
  const safeString = (value: any) => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const safeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const safeDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const safeBool = (value: boolean | null | undefined) => {
    if (value === null || value === undefined) return "";
    return value ? "true" : "false"; // Adjust according to API expectations
  };

  // Basic information
  formData.append("entry_date", safeString(data?.testDate || ""));
  formData.append("patient_id", safeString(user?.userId || ""));

  // Anthropometric Parameters - these are numbers in the schema
  formData.append("height", safeNumber(healthProfile.height));
  formData.append("weight", safeNumber(healthProfile.weight));
  formData.append("main_diagnoses", safeString(healthProfile.primaryDiagnosis));
  formData.append("diagnosis_date", safeDate(healthProfile?.diagnosisDate));

  // Medications - handle separately based on API expectations
  if (medications && medications.length > 0) {
    const medicationsList = medications.map((med) => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: med.startDate ? safeDate(med.startDate) : "",
    }));
    formData.append("medications", JSON.stringify(medicationsList));
  }

  // GI History
  formData.append("past_issues", safeString(giHistory?.pastIssues));
  formData.append("onset_date", safeDate(giHistory?.onsetDate));
  formData.append(
    "treatments_undertaken",
    safeString(giHistory?.treatmentReceived)
  );
  formData.append("gi_conditions", safeString(giHistory?.familyConditions));
  formData.append(
    "other_relevant_conditions",
    safeString(giHistory?.otherRelevantConditions)
  );
  formData.append(
    "degree_of_kinship",
    safeString(giHistory?.relationshipDegree)
  );

  // Surgery info
  formData.append("surgery_type", safeString(giHistory?.surgeryType));
  formData.append("surgery_date", safeDate(giHistory?.surgeryDate));
  formData.append("surgery_outcome", safeString(giHistory?.surgeryOutcome));

  // Bowel function - these are numbers in the schema
  formData.append(
    "evacuation_frequency",
    safeString(giHistory?.bowelMovementFreq)
  );
  formData.append("bristol_scale", safeNumber(giHistory?.bristolStoolScale));

  // Symptoms - these are Int in the schema
  formData.append("bloating", safeNumber(giHistory?.bloating));
  formData.append("intestinal_gas", safeNumber(giHistory?.gas));
  formData.append("abdominal_pain", safeNumber(giHistory?.abdominalPain));
  formData.append(
    "digestive_difficulties",
    safeNumber(giHistory?.digestiveDifficulty)
  );

  // Food sensitivities
  formData.append(
    "diagnosed_intolerances",
    safeString(giHistory?.diagonesedIntolerances)
  );
  formData.append(
    "certified_allergies",
    safeString(giHistory?.certifiedAllergies)
  );
  formData.append("tests_performed", safeString(giHistory?.testsPerformed));

  // Nutrition profile
  formData.append("diet_type", safeString(nutritionProfile?.dietType));
  if (nutritionProfile?.dietType === DIET_TYPE.Other) {
    formData.append("other_diet", safeString(nutritionProfile?.otherDietType));
  }

  // Weekly consumption (all are Int in the schema)
  formData.append(
    "vegetable_portions",
    safeNumber(nutritionProfile?.vegetables)
  );
  formData.append(
    "animal_proteins",
    safeNumber(nutritionProfile?.animalProteins)
  );
  formData.append("fruit_servings", safeNumber(nutritionProfile?.fruits));
  formData.append(
    "plant_proteins",
    safeNumber(nutritionProfile?.plantProteins)
  );
  formData.append("whole_grains", safeNumber(nutritionProfile?.wholeGrains));
  formData.append(
    "dairy_products",
    safeNumber(nutritionProfile?.dairyProducts)
  );
  formData.append(
    "fermented_foods",
    safeNumber(nutritionProfile?.fermentedFoods)
  );

  // Hydration & alcohol (Int in schema)
  formData.append("water_consumption", safeNumber(nutritionProfile?.water));
  formData.append("alcohol_consumption", safeNumber(nutritionProfile?.alcohol));

  // Meal timing
  formData.append(
    "breakfast_time",
    safeString(nutritionProfile?.breakfastTime)
  );
  formData.append("lunch_time", safeString(nutritionProfile?.lunchTime));
  formData.append("dinner_time", safeString(nutritionProfile?.dinnerTime));
  formData.append("snacks_time", safeString(nutritionProfile?.snackTime));

  // Lifestyle
  formData.append(
    "physical_activity_type",
    safeString(nutritionProfile?.physicalActivityType)
  );
  formData.append(
    "physical_activity_frequency",
    safeNumber(nutritionProfile?.physicalActivityFrequency)
  );
  formData.append(
    "average_session_duration",
    safeNumber(nutritionProfile?.physicalActivityDuration)
  );

  formData.append(
    "avg_sleep_hours",
    safeNumber(nutritionProfile?.sleepDuration)
  );
  formData.append("sleep_quality", safeNumber(nutritionProfile?.sleepQuality));
  formData.append(
    "sleep_problems",
    safeString(nutritionProfile?.specificSleepIssues)
  );

  formData.append("stress_level", safeNumber(nutritionProfile?.stressLevel));
  formData.append("smoking", safeBool(nutritionProfile?.smokingStatus));

  if (nutritionProfile?.smokingStatus === true) {
    formData.append(
      "smoking_quantity",
      safeNumber(nutritionProfile?.smokingAmount)
    );
  }

  // Current therapies
  formData.append(
    "antibiotic_name",
    safeString(nutritionProfile?.antibioticsName)
  );
  formData.append(
    "recent_antibiotics",
    safeBool(nutritionProfile?.isRecentlyOnAntibiotics)
  );
  formData.append(
    "end_of_therapy_date",
    safeDate(nutritionProfile?.antibioticsEndDate)
  );

  // Supplements
  formData.append("probiotics", safeString(nutritionProfile?.probioticsName));
  formData.append("minerals", safeString(nutritionProfile?.probioticsMinerals));
  formData.append("prebiotics", safeString(nutritionProfile?.prebioticsName));
  formData.append("vitamins", safeString(nutritionProfile?.vitaminsName));
  formData.append(
    "other_supplements",
    safeString(nutritionProfile?.otherSupplements)
  );

  // Goals and motivation - all these are String in your schema, not Boolean
  formData.append(
    "preventiveWellness",
    safeString(goalsMotivation?.preventiveWellness)
  );
  formData.append(
    "digestiveOptimization",
    safeString(goalsMotivation?.digestiveOptimization)
  );
  formData.append(
    "weightManagement",
    safeString(goalsMotivation?.weightManagement)
  );
  formData.append(
    "sportsPerformance",
    safeString(goalsMotivation?.sportsPerformance)
  );
  formData.append("stressBalance", safeString(goalsMotivation?.stressBalance));
  formData.append(
    "postAntibioticRecovery",
    safeString(goalsMotivation?.postAntibioticRecovery)
  );
  formData.append("immuneSupport", safeString(goalsMotivation?.immuneSupport));
  formData.append("womensHealth", safeString(goalsMotivation?.womensHealth));
  formData.append(
    "activeLongevity",
    safeString(goalsMotivation?.activeLongevity)
  );
  formData.append(
    "cardiovascularHealth",
    safeString(goalsMotivation?.cardiovascularHealth)
  );
  formData.append("skinHealth", safeString(goalsMotivation?.skinHealth));
  formData.append(
    "urineryTractWellness",
    safeString(goalsMotivation?.urineryTractWellness)
  );

  // Secondary goals and related (arrays in schema)
  if (
    goalsMotivation?.secondaryGoal &&
    goalsMotivation.secondaryGoal.length > 0
  ) {
    formData.append(
      "secondary_goals",
      JSON.stringify(goalsMotivation.secondaryGoal)
    );
  } else {
    formData.append("secondary_goals", JSON.stringify([]));
  }

  formData.append(
    "intervention_priority",
    safeString(goalsMotivation?.interventionPriority)
  );
  formData.append("dietary", safeString(goalsMotivation?.dietary));
  formData.append(
    "supplementation",
    safeString(goalsMotivation?.supplementation)
  );

  if (
    goalsMotivation?.potentialObstacles &&
    goalsMotivation.potentialObstacles.length > 0
  ) {
    formData.append(
      "potential_obstacles",
      JSON.stringify(goalsMotivation.potentialObstacles)
    );
  } else {
    formData.append("potential_obstacles", JSON.stringify([]));
  }

  if (
    goalsMotivation?.supportNeeded &&
    goalsMotivation.supportNeeded.length > 0
  ) {
    formData.append(
      "support_needed",
      JSON.stringify(goalsMotivation.supportNeeded)
    );
  } else {
    formData.append("support_needed", JSON.stringify([]));
  }

  try {
    console.log("Start uploading test report------------------");
    const response = await axios.post(
      "http://10.0.10.35:8001/api/extract-and-analyze-form/",
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000000,
      }
    );
    console.log("Response data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    // Log the specific validation errors
    if (error.response && error.response.data) {
      console.error(
        "Validation errors:",
        JSON.stringify(error.response.data, null, 2)
      );

      // Extract the specific detail message if available
      if (error.response.data.detail) {
        throw new Error(
          `Failed to upload test report: ${JSON.stringify(
            error.response.data.detail
          )}`
        );
      }
    }

    throw new Error(`Failed to upload test report: ${error.message}`);
  }
};

export const TestReportService = {
  uploadTestReport,
};
