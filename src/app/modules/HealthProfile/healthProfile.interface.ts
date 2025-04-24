export interface HealthProfile {
  userId: string;

  height?: number;
  weight?: number;
  bmi?: number;
  primaryDiagnosis?: string;
  diagnosisDate?: Date;

//   medications: Medication[];
//   giHistory?: GIHistory;
//   nutritionProfile?: NutritionProfile;
}

export interface Medication {
  profileId: string;

  name: string;
  dosage: string;
  frequency: string;
  startDate?: Date;
}

export interface GIHistory {
  profileId: string;

  pastIssues?: string;
  onsetDate?: Date;
  treatmentReceived?: string;
  familyConditions?: string;
  otherRelevantConditions?: string;
  relationshipDegree?: string;
  surgeryType?: string;
  surgeryOutcome?: string;
  surgeryDate?: Date;
  bowelMovementFreq?: string;
  bristolStoolScale?: number;
  bloating?: number;
  gas?: number;
  abdominalPain?: number;
  digestiveDifficulty?: number;
  diagonesedIntolerances?: string;
  certifiedAllergies?: string;
  testsPerformed?: string;
}

export enum DIET_TYPE {
  Omnivore = "Omnivore",
  Vegetarian = "Vegetarian",
  Vegan = "Vegan",
  Other = "Other",
}

export interface NutritionProfile {
  profileId: string;

  dietType?: DIET_TYPE;
  otherDietType?: string;
  vegetables?: number;
  animalProteins?: number;
  fruits?: number;
  plantProteins?: number;
  wholeGrains?: number;
  dairyProducts?: number;
  water?: number;
  alcohol?: number;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  snackTime?: string;
  physicalActivityType?: string;
  physicalActivityFrequency?: number;
  physicalActivityDuration?: number;
  sleepDuration?: number;
  sleepQuality?: number;
  specificSleepIssues?: string;
  stressLevel?: number;
  smokingStatus?: boolean;
  smokingAmount?: number;
  antibioticsName?: string;
  isRecentlyOnAntibiotics?: boolean;
  antibioticsEndDate?: Date;
  probioticsName?: string;
  probioticsMinerals?: string;
  prebioticsName?: string;
  vitaminsName?: string;
  preventiveWellness?: string;
  digestiveOptimization?: string;
  weightManagement?: string;
  sportsPerformance?: string;
  stressBalance?: string;
  postAntibioticRecovery?: string;
  immuneSupport?: string;
  womensHealth?: string;
  activeLongevity?: string;
  cardiovascularHealth?: string;
  skinHealth?: string;
  urineryTractWellness?: string;
  secondaryGoal?: string[];
  interventionPriorities?: string[];
  dietary?: string[];
  supplementation?: string[];
  potentialObstacles?: string[];
  supportNeeded?: string[];
  notes?: string;
  isAuthorizeProcessingPersonalData?: boolean;
  isConsentPersonalizedService?: boolean;
  isAcceptTermsAndConditions?: boolean;
}
