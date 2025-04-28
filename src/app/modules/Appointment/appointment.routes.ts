import express from "express";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post('/', AppointmentController.createAppointment);
router.get("/partner/:id", AppointmentController.partnarAppointment);
router.get("/patient/:id", AppointmentController.patientAppointment);
router.patch("/:id",AppointmentController.updateStatus);
router.get('/partner-history/:id', AppointmentController.partnerAppintmentHistory);

export const AppointmentRoutes = router;