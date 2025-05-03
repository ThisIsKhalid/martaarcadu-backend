import express from "express";
import { UtilsController } from "./utils.controller";

const router = express.Router();

router.get(
  "/admin-dashboard",
  UtilsController.getAdminDashboardData
);

router.get("/admin-dashboard-wallet", UtilsController.getDashboardWallet);

router.get("/admin-dashboard-transaction", UtilsController.getTransaction);

export const UtilsRoutes = router;