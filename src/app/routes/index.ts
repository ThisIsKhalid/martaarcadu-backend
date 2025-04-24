import express from "express";
import { HealthProfileRoutes } from "../modules/HealthProfile/healthProfile.route";
import { UserRoutes } from "../modules/User/user.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/health-profile",
    route: HealthProfileRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
