import express from "express";
import { HealthProfileController } from "./healthProfile.controller";

const router = express.Router();

router.post("/", HealthProfileController.createHealthProfile);

export const HealthProfileRoutes = router;
