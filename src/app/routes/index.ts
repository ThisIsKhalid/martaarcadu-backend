import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { HealthProfileRoutes } from "../modules/HealthProfile/healthProfile.route";
import { PartnerRoutes } from "../modules/Partner/partner.route";
import { TestReportRoutes } from "../modules/TestReport/testReport.route";
import { UserRoutes } from "../modules/User/user.route";
import { BlogRoutes } from "../modules/Blog/blog.route";
import { CartRoutes } from "../modules/Cart/cart.routes";
import { ProductRoutes } from "../modules/Product/product.route";
import { AppointmentRoutes } from "../modules/Appointment/appointment.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/partner",
    route: PartnerRoutes,
  },
  {
    path: "/health-profile",
    route: HealthProfileRoutes,
  },
  {
    path: "/test-report",
    route: TestReportRoutes,
  },
  {
    path: "/blog",
    route: BlogRoutes,
  },
  {
    path: "/cart",
    route: CartRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/appointment",
    route: AppointmentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
