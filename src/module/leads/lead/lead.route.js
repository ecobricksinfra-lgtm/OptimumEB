import { Router } from "express";
import {
  addFollowUp,
  createLead,
  deleteLead,
  getAllLeads,
  getFollowUpsByLead,
  getLeadDocuments,
  transferLeads,
  updateLead,
  uploadLeadDocuments,
} from "./lead.controller.js";
import { upload } from "../../../config/multer.js";

const leadRoute = Router();

leadRoute.post("/add", createLead);

// leadRoute.get("/campaign/:campaignId", getLeadsByCampaign);
leadRoute.get("/getallleads", getAllLeads);
leadRoute.put("/updatelead/:id", updateLead);
leadRoute.put("/transferleads", transferLeads);
leadRoute.delete("/:id", deleteLead);

leadRoute.post("/followup/add", addFollowUp);
leadRoute.get("/getfollowup/:leadId", getFollowUpsByLead);

leadRoute.post(
  "/upload-documents",
  upload.array("documents", 5),
  uploadLeadDocuments
);
leadRoute.get("/:leadId/documents", getLeadDocuments);

export default leadRoute;
