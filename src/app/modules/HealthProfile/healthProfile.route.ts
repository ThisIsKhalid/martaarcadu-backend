import express from "express";
import { HealthProfileController } from "./healthProfile.controller";

const router = express.Router();

router.put("/", HealthProfileController.createHealthProfile);

router.put("/gi-history", HealthProfileController.createGIHistory);

router.put(
  "/nutrition-profile",
  HealthProfileController.createNutritionProfile
);

router.put("/goals-motivation", HealthProfileController.createGoalsMotivation);

router.get("/:userId", HealthProfileController.getHealthProfile);

export const HealthProfileRoutes = router;
