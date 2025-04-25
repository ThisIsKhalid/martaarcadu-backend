import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { PartnerController } from "./partner.controller";

const router = express.Router();

const upload = multer({
  storage: createStorage("partner"),
});

const imageUpload = upload.single("profilePhoto");

router.post("/", imageUpload, PartnerController.createPartnerAcc);

export const PartnerRoutes = router;
