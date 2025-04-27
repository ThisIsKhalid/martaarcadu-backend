import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { HealthProfileRoutes } from "../modules/HealthProfile/healthProfile.route";
import { PartnerRoutes } from "../modules/Partner/partner.route";
import { TestReportRoutes } from "../modules/TestReport/testReport.route";
import { UserRoutes } from "../modules/User/user.route";
import { BlogRoutes } from "../modules/Blog/blog.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
