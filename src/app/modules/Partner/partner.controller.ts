import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PartnerService } from "./partner.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";

const createPartnerAcc = catchAsync(async (req: Request, res: Response) => {
  const { file, body } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile photo is required");
  }

  const data = {
    ...body,
    profilePhoto: `${config.backend_image_url}/partner/${file.filename}`,
  };

  const result = await PartnerService.createPartnerAcc(data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner account created successfully",
    data: result,
  });
});


const getAllPartner = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "date"]);
  const options = pick(req.query, paginationFields);

  const result = await PartnerService.getAllPartner(filters, options)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner retrieved successfully",
    data: result,
  });
})

const getSinglePartner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PartnerService.getSinglePartner(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner retrieved successfully",
    data: result,
  });
})


const updatePartner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { file, body } = req;

  let imageUrl;

  if (file) {
      imageUrl =  `${config.backend_image_url}/partner/${file.filename}`
  }
  const data = {
    ...body,
    profilePhoto: imageUrl,
  };

  const result = await PartnerService.updatePartner(id, data)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner retrieved successfully",
    data: result,
  });
})


const updateVisibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {isVisible} = req.body;

  const product = await PartnerService.updateVisibility(id, isVisible);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner retrieved successfully",
    data: product,
  });
});


const deletePartner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PartnerService.deletePartner(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delete partner successfully",
    data: result,
  });
})


export const PartnerController = {
  createPartnerAcc,
  getAllPartner,
  getSinglePartner,
  updatePartner,
  updateVisibility,
  deletePartner,
};
