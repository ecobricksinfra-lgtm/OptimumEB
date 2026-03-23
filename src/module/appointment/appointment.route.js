import { Router } from "express";
import {
  createAppointment,
  createAppointmentbyCamp,
  deleteAppointment,
  getAllAppointments,
  updateAppointment,
  updateAppointmentById,
} from "./appointment.controller.js";

const appointmentRoute = Router();

appointmentRoute.post("/add", createAppointment);
appointmentRoute.post("/create", createAppointmentbyCamp);

appointmentRoute.get("/getallappointments", getAllAppointments);

appointmentRoute.put("/updateappointment/:token_id", updateAppointment);
// ✅ NEW: Update by MongoDB _id
appointmentRoute.put("/update/:id", updateAppointmentById);

appointmentRoute.delete("/:id", deleteAppointment);

export default appointmentRoute;
