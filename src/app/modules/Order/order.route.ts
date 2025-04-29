import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../User/user.interface";
import { OrderController } from "./order.controller";

const router = express.Router();

router.post("/", auth(UserRole.USER), OrderController.createOrder);

router.post("/confirm/:orderId", OrderController.confirmOrder);

router.delete("/:id", OrderController.deleteOrder);

router.get("/", OrderController.getAllOrders);

router.get("/:id", OrderController.getOrderById);

export const OrderRoutes = router;
