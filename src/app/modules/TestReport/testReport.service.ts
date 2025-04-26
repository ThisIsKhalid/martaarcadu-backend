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

  formData.append("height", healthProfile.height);
  formData.append("weight", healthProfile.weight);
  formData.append("main_diagnoses", healthProfile.primaryDiagnosis);
  formData.append("diagnosis_date", healthProfile.diagnosisDate);

  // medication jhamela ase

  formData.append("past_issues", giHistory?.pastIssues);
  formData.append("onset_date", giHistory?.onsetDate);
  formData.append("treatments_undertaken", giHistory?.treatmentReceived);

  formData.append("gi_conditions", giHistory?.familyConditions);
  formData.append(
    "other_relevant_conditions",
    giHistory?.otherRelevantConditions
  );
  formData.append("degree_of_kinship", giHistory?.relationshipDegree);

  formData.append("surgery_type", giHistory?.surgeryType);
  formData.append("surgery_date", giHistory?.surgeryOutcome);
  formData.append("surgery_outcome", giHistory?.surgeryDate);

  formData.append("evacuation_frequency", giHistory?.bowelMovementFreq);
  formData.append("bristol_scale", giHistory?.bristolStoolScale);

  formData.append("bloating", giHistory?.bloating);
  formData.append("intestinal_gas", giHistory?.gas);
  formData.append("abdominal_pain", giHistory?.abdominalPain);
  formData.append("digestive_difficulties", giHistory?.digestiveDifficulty);

  formData.append("diagnosed_intolerances", giHistory?.diagonesedIntolerances);
  formData.append("certified_allergies", giHistory?.certifiedAllergies);
  formData.append("tests_performed", giHistory?.testsPerformed);

  formData.append("diet_type", nutritionProfile?.dietType);
  formData.append("other_diet", nutritionProfile?.otherDietType);

  formData.append("vegetable_portions", nutritionProfile?.vegetables);
  formData.append("animal_proteins", nutritionProfile?.animalProteins);
  formData.append("fruit_servings", nutritionProfile?.fruits);
  formData.append("plant_proteins", nutritionProfile?.plantProteins);
  formData.append("whole_grains", nutritionProfile?.wholeGrains);
  formData.append("dairy_products", nutritionProfile?.dairyProducts);

  formData.append("water_consumption", nutritionProfile?.water);
  formData.append("alcohol_consumption", nutritionProfile?.alcohol);

  formData.append("breakfast_time", nutritionProfile?.breakfastTime);
  formData.append("lunch_time", nutritionProfile?.lunchTime);
  formData.append("dinner_time", nutritionProfile?.dinnerTime);
  formData.append("snacks_time", nutritionProfile?.snackTime);

  formData.append(
    "physical_activity_type",
    nutritionProfile?.physicalActivityType
  );
  formData.append(
    "physical_activity_frequency",
    nutritionProfile?.physicalActivityFrequency
  );
  formData.append(
    "average_session_duration",
    nutritionProfile?.physicalActivityDuration
  );

  formData.append("avg_sleep_hours", nutritionProfile?.sleepDuration);
  formData.append("sleep_quality", nutritionProfile?.sleepQuality);
  formData.append("sleep_problems", nutritionProfile?.specificSleepIssues);

  formData.append("stress_level", nutritionProfile?.stressLevel);
  formData.append("smoking", nutritionProfile?.smokingStatus);
  formData.append("smoking_quantity", nutritionProfile?.smokingAmount);

  formData.append("antibiotic_name", nutritionProfile?.antibioticsName);
  formData.append(
    "recent_antibiotics",
    nutritionProfile?.isRecentlyOnAntibiotics
  );
  formData.append("end_of_therapy_date", nutritionProfile?.antibioticsEndDate);

  formData.append("probiotics", nutritionProfile?.probioticsName);
  formData.append("minerals", nutritionProfile?.probioticsMinerals);
  formData.append("prebiotics", nutritionProfile?.prebioticsName);
  formData.append("vitamins", nutritionProfile?.vitaminsName);
  formData.append("other_supplements", nutritionProfile?.otherSupplements);

  // gihisitory jhamela

  // --------------------------------

  try {
    const response = await axios.post(
      "http://10.0.10.35:8001/api/extract-and-analyze-form/",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    console.log("Response:--------", response.data);
  } catch (error: any) {
    console.error("Error details:", error.response.data.detail);
    throw new Error("Failed to upload test report.");
  }
};

export const TestReportService = {
  uploadTestReport,
};
