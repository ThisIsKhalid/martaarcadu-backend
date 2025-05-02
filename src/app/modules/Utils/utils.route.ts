import express from "express";
import { UtilsController } from "./utils.controller";

const router = express.Router();

router.get(
  "/admin-dashboard/:month/:year",
  UtilsController.getAdminDashboardData
);

router.get("/admin-dashboard-wallet/:month/:year", UtilsController.getDashboardWallet);

router.get("/admin-dashboard-transaction/:month", UtilsController.getTransaction);

export const UtilsRoutes = router;