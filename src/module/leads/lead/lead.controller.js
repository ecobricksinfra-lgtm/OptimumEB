import LeadService from "./lead.service.js";
import jwt from "jsonwebtoken";

// ===============================
// CREATE LEAD
// ===============================
export const createLead = async (req, res) => {
  try {
    const lead = await LeadService.createLead(req.body);
    res.status(201).json({ status: true, data: lead });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};





export const getAllLeads = async (req, res) => {
  try {
    const { role_name, name } = req.query;

    if (!role_name || !name) {
      return res.status(400).json({
        status: false,
        message: "role_name and name are required",
      });
    }

    const leads = await LeadService.getLeadsByRole(role_name, name);

    res.status(200).json({
      status: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};






// ===============================
// TRANSFER LEADS
// ===============================
export const transferLeads = async (req, res) => {
  try {
    const { leadIds, bdname } = req.body;

    await LeadService.transferLeads(leadIds, bdname);

    res.status(200).json({
      status: true,
      message: "Leads transferred successfully & Notification sent to BD",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ===============================
// DELETE LEAD
// ===============================
export const deleteLead = async (req, res) => {
  try {
    await LeadService.deleteLead(req.params.id);
    res.status(200).json({ status: true, message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};





export const addFollowUp = async (req, res) => {
  try {
    const followUp = await LeadService.addFollowUp(req.body);

    res.status(201).json({
      status: true,
      message: "Follow-up added successfully",
      data: followUp,
    });

  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};



export const getFollowUpsByLead = async (req, res) => {
  try {
    const data = await LeadService.getFollowUpsByLead(req.params.leadId);

    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};


export const uploadLeadDocuments = async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ status: false, message: "No files uploaded" });
    }

    const data = await LeadService.uploadDocuments(leadId, req.files);

    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

export const getLeadDocuments = async (req, res) => {
  try {
    const documents = await LeadService.getDocumentsByLead(
      req.params.leadId
    );

    res.status(200).json({
      status: true,
      data: documents,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};


export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      email,
      age,
      weight,
      circle,
      notes,
      status,
    } = req.body;

    const updatedLead = await LeadService.updateLeadById(
      id,
      {
        name,
        phone,
        email,
        age,
        weight,
        circle,
        notes,
        status,
      }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

