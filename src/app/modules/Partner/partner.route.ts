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
router.get("/", PartnerController.getAllPartner);
router.get("/:id", PartnerController.getSinglePartner);
router.put('/:id',imageUpload, PartnerController.updatePartner);
router.patch("/update-visibility/:id", PartnerController.updateVisibility);
router.delete("/:id", PartnerController.deletePartner);


export const PartnerRoutes = router;
