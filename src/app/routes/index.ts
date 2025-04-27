import express from "express";
import { AppointmentRoutes } from "../modules/Appointment/appointment.routes";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { BlogRoutes } from "../modules/Blog/blog.route";
import { CartRoutes } from "../modules/Cart/cart.routes";
import { HealthProfileRoutes } from "../modules/HealthProfile/healthProfile.route";
import { OrderRoutes } from "../modules/Order/order.route";
import { PartnerRoutes } from "../modules/Partner/partner.route";
import { ProductRoutes } from "../modules/Product/product.route";
import { TestReportRoutes } from "../modules/TestReport/testReport.route";
import { UserRoutes } from "../modules/User/user.route";

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
  {
    path: "/order",
    route: OrderRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
