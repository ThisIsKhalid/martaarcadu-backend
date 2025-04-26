import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { TestReportController } from "./testReport.controller";

const router = express.Router();

const upload = multer({ storage: createStorage("testReport") });

const fileUpload = upload.single("file");

router.post(
  "/upload-test-report",
  fileUpload,
  TestReportController.uploadTestReport
);

export const TestReportRoutes = router;
