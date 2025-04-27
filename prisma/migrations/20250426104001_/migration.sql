-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DIET_TYPE" AS ENUM ('Omnivore', 'Vegetarian', 'Vegan', 'Other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAgreedToTermsCondition" BOOLEAN NOT NULL DEFAULT false,
    "isPersonalClinicalIdentificationData" BOOLEAN NOT NULL DEFAULT false,
    "isDigestiveHistoryBackgroundData" BOOLEAN NOT NULL DEFAULT false,
    "isDietSensitivitiesHabitsData" BOOLEAN NOT NULL DEFAULT false,
    "isGoalMotivationConsentData" BOOLEAN NOT NULL DEFAULT false,
    "isPartner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pricePerConsultation" DOUBLE PRECISION NOT NULL,
    "availableDayStart" TEXT NOT NULL,
    "availableDayEnd" TEXT NOT NULL,
    "availableTime" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "primaryDiagnosis" TEXT,
    "diagnosisDate" TIMESTAMP(3),

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gi_histories" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "pastIssues" TEXT,
    "onsetDate" TIMESTAMP(3),
    "treatmentReceived" TEXT,
    "familyConditions" TEXT,
    "otherRelevantConditions" TEXT,
    "relationshipDegree" TEXT,
    "surgeryType" TEXT,
    "surgeryOutcome" TEXT,
    "surgeryDate" TIMESTAMP(3),
    "bowelMovementFreq" TEXT,
    "bristolStoolScale" INTEGER,
    "bloating" INTEGER,
    "gas" INTEGER,
    "abdominalPain" INTEGER,
    "digestiveDifficulty" INTEGER,
    "diagonesedIntolerances" TEXT,
    "certifiedAllergies" TEXT,
    "testsPerformed" TEXT,

    CONSTRAINT "gi_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "dietType" "DIET_TYPE",
    "otherDietType" TEXT,
    "vegetables" INTEGER,
    "animalProteins" INTEGER,
    "fruits" INTEGER,
    "plantProteins" INTEGER,
    "wholeGrains" INTEGER,
    "dairyProducts" INTEGER,
    "water" INTEGER,
    "alcohol" INTEGER,
    "breakfastTime" TEXT,
    "lunchTime" TEXT,
    "dinnerTime" TEXT,
    "snackTime" TEXT,
    "physicalActivityType" TEXT,
    "physicalActivityFrequency" INTEGER,
    "physicalActivityDuration" INTEGER,
    "sleepDuration" INTEGER,
    "sleepQuality" INTEGER,
    "specificSleepIssues" TEXT,
    "stressLevel" INTEGER,
    "smokingStatus" BOOLEAN,
    "smokingAmount" INTEGER,
    "antibioticsName" TEXT,
    "isRecentlyOnAntibiotics" BOOLEAN,
    "antibioticsEndDate" TIMESTAMP(3),
    "probioticsName" TEXT,
    "probioticsMinerals" TEXT,
    "prebioticsName" TEXT,
    "vitaminsName" TEXT,
    "otherSupplements" TEXT,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals_motivations" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "preventiveWellness" TEXT,
    "digestiveOptimization" TEXT,
    "weightManagement" TEXT,
    "sportsPerformance" TEXT,
    "stressBalance" TEXT,
    "postAntibioticRecovery" TEXT,
    "immuneSupport" TEXT,
    "womensHealth" TEXT,
    "activeLongevity" TEXT,
    "cardiovascularHealth" TEXT,
    "skinHealth" TEXT,
    "urineryTractWellness" TEXT,
    "secondaryGoal" TEXT[],
    "interventionPriorities" TEXT[],
    "dietary" TEXT[],
    "supplementation" TEXT[],
    "potentialObstacles" TEXT[],
    "supportNeeded" TEXT[],
    "notes" TEXT,
    "isAuthorizeProcessingPersonalData" BOOLEAN,
    "isConsentPersonalizedService" BOOLEAN,
    "isAcceptTermsAndConditions" BOOLEAN,

    CONSTRAINT "goals_motivations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "discount" DOUBLE PRECISION,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "totalSell" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" TIMESTAMP(3),
    "banner" TEXT NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_userId_key" ON "partners"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "health_profiles_userId_key" ON "health_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "gi_histories_profileId_key" ON "gi_histories"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_profiles_profileId_key" ON "nutrition_profiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "goals_motivations_profileId_key" ON "goals_motivations"("profileId");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gi_histories" ADD CONSTRAINT "gi_histories_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals_motivations" ADD CONSTRAINT "goals_motivations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
