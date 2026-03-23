import LeadModel from "./lead.model.js";
import CampaignModel from "../campaign/campaign.model.js";
import IdcodeServices from "../../idcode/idcode.service.js";
import NotificationModel from "../../notifications/notify.model.js";
import EmployeeModel from "../../employee/employee.model.js";

class LeadService {
  // ===============================
  // CREATE LEAD
  // ===============================
  static async createLead(leadData) {
    const idname = "Leads";
    const idcode = "L";

    await IdcodeServices.addIdCode(idname, idcode);
    const lead_id = await IdcodeServices.generateCode(idname);
    if (!lead_id) throw new Error("Failed to generate lead ID");

    const phone = String(leadData.phone).replace(/\D/g, "");

    const existingLead = await LeadModel.findOne({ phone });
    if (existingLead) {
      // Throw an error or return a special response
      throw new Error("Phone number already exists");
    }

    const campaign = await CampaignModel.findOne({
      campaign_id: leadData.campaign_id,
    });
    if (!campaign) throw new Error("Campaign not found");

    const lead = await LeadModel.create({
      ...leadData,
      lead_id,
      campaign: campaign._id,
      campaign_id: campaign.campaign_id,
    });

    campaign.leads.push(lead._id);
    await campaign.save();

    return lead;
  }

  // ===============================
  // GET LEADS BASED ON ROLE
  // ===============================
  static async getLeadsByRole(role_name, name) {
    // ADMIN → all leads
    if (role_name === "admin") {
      return await LeadModel.find().populate("campaign").sort({ createdAt: -1 });
    }

    // BD / Employee → only their leads
    return await LeadModel.find({ bdname: name }).populate("campaign").sort({ createdAt: -1 });
  }

  // ===============================
  // TRANSFER LEADS
  // ===============================
  static async transferLeads(leadIds, bdname) {
    if (!leadIds?.length) {
      throw new Error("No leads selected");
    }
    if (!bdname) {
      throw new Error("BD name is required");
    }

    // 🔍 FIND BD USING NAME
    const bd = await EmployeeModel.findOne({
      name: bdname,
    });

    console.log(bd);

    if (!bd) {
      throw new Error("BD not found for given name");
    }

    // 1️⃣ Update leads
    await LeadModel.updateMany(
      { lead_id: { $in: leadIds } },
      {
        $set: {
          bdname,
        },
      }
    );

    // 2️⃣ Create notification
    await NotificationModel.create({
      title: "New Leads Assigned",
      message: `You have been assigned ${leadIds.length} new lead(s).`,
      employee_id: bd.employee_id,
    });

    return true;
  }
  // ===============================
  // DELETE LEAD
  // ===============================
  static async deleteLead(leadId) {
    const lead = await LeadModel.findById(leadId);
    if (!lead) throw new Error("Lead not found");

    await CampaignModel.findByIdAndUpdate(lead.campaign, {
      $pull: { leads: lead._id },
    });

    await LeadModel.findByIdAndDelete(leadId);

    return { message: "Lead deleted successfully" };
  }

  static async addFollowUp({ lead_id, follow_up_date, notes, createdBy }) {
    const lead = await LeadModel.findOne({ lead_id });

    if (!lead) throw new Error("Lead not found");

    await LeadModel.updateOne(
      { lead_id },
      {
        $push: {
          follow_up: {
            follow_up_date,
            notes,
            createdBy,
          },
        },
        $set: { status: "follow-up" },
      }
    );

    return lead.follow_up.at(-1);
  }

  static async getFollowUpsByLead(leadId) {
    const lead = await LeadModel.findOne(
      { lead_id: leadId },
      { follow_up: 1, _id: 0 }
    );

    if (!lead) throw new Error("Lead not found");

    return lead.follow_up.sort(
      (a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date)
    );
  }

  static async uploadDocuments(leadId, files) {
    const documents = files.map((file) => ({
      fileName: file.originalname,
      fileType: file.mimetype,
      fileKey: file.key, // S3 key
      fileUrl: file.location, // S3 public URL
    }));

    return LeadModel.findOneAndUpdate(
      { lead_id: leadId },
      { $push: { documents: { $each: documents } } },
      { new: true }
    );
  }

  static async getDocumentsByLead(leadId) {
    const lead = await LeadModel.findOne({ lead_id: leadId }).select(
      "documents"
    );

    if (!lead) {
      throw new Error("Lead not found");
    }

    return lead.documents || [];
  }

  static async updateLeadById(leadId, updateData) {
    const updatedLead = await LeadModel.findByIdAndUpdate(leadId, updateData, {
      new: true,
      runValidators: true,
    });

    return updatedLead;
  }
}

export default LeadService;
