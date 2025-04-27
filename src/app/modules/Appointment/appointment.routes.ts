import express from "express";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post('/', AppointmentController.createAppointment);
router.get("/:id", AppointmentController.partnarAppointment);

export const AppointmentRoutes = router;