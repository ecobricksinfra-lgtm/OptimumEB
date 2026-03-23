import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    follow_up_date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const documentSchema = new mongoose.Schema({
  fileName: String,
  fileType: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema(
  {
    lead_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String,},
    profession: { type: String,},
    email: { type: String },
    source: { type: String },
    age: { type: String },
    weight: { type: String },
    circle: { type: String },
    notes: { type: String },
    treatment: { type: String },
    bdname: { type: String, default: "" },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaigns" },
    campaign_id: { type: String },
     status: { type: String, default: "new" },
    documents: [documentSchema],
    follow_up: [followUpSchema],
  },
  { timestamps: true }
);

const LeadModel = mongoose.model("Leads", leadSchema);
export default LeadModel;
