import AppointmentService from "./appointment.service.js";

// ✅ Create appointment (general)
export const createAppointment = async (req, res) => {
  try {
    const data = await AppointmentService.addAppointment(req.body);
    res.status(201).json({
      status: true,
      message: "Appointment created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Create appointment by campaign
export const createAppointmentbyCamp = async (req, res) => {
  try {
    const data = await AppointmentService.createAppointment(req.body);
    res.status(201).json({
      status: true,
      message: "Appointment created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const data = await AppointmentService.getAllAppointments();
    res.status(200).json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Get appointments by campaign
export const getAppointmentsByCampaign = async (req, res) => {
  try {
    const appointments = await AppointmentService.getAppointmentsByCampaign(
      req.params.campaignId
    );
    res.status(200).json({ status: true, data: appointments });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const data = await AppointmentService.updateAppointment(
      req.params.token_id,
      req.body
    );
    if (!data)
      return res
        .status(404)
        .json({ status: false, message: "Appointment not found" });
    res
      .status(200)
      .json({ status: true, message: "Appointment updated", data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ NEW: Update appointment by _id (for frontend)
export const updateAppointmentById = async (req, res) => {
  try {
    console.log("🔄 Update request received");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);

    const data = await AppointmentService.updateAppointmentById(
      req.params.id,
      req.body
    );

    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: "Appointment not found" });
    }

    console.log("✅ Appointment updated successfully");
    res
      .status(200)
      .json({ 
        status: true, 
        message: "Appointment updated successfully", 
        data 
      });
  } catch (err) {
    console.error("❌ Error updating appointment:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const result = await AppointmentService.deleteAppointment(req.params.id);
    res.status(200).json({ status: true, message: result.message });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
