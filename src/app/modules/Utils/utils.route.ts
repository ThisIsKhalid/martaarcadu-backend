import express from "express";
import { UtilsController } from "./utils.controller";

const router = express.Router();

router.get(
  "/admin-dashboard/:month/:year",
  UtilsController.getAdminDashboardData
);

export const UtilsRoutes = router;