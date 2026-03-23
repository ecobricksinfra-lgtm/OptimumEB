import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import {
  scheduleCronJobs,
  scheduleCronWFH,
  scheduleCronLeaveStatus,
} from "./src/config/cron.js";

import connectDB from "./src/config/db.js";
import roleRoute from "./src/module/role/role.route.js";
import morgan from "morgan";
import logger from "./src/config/logger.js";
import employeeRoute from "./src/module/employee/employee.route.js";
import appointmentRoute from "./src/module/appointment/appointment.route.js";
import taskRoute from "./src/module/task/task.route.js";
import campaignRoute from "./src/module/leads/campaign/campaign.route.js";
import leadRoute from "./src/module/leads/lead/lead.route.js";
import doctorRoute from "./src/module/doctor/doctor.route.js";
import hospitalRoute from "./src/module/hospital/hospital.route.js";
import notificationRoute from "./src/module/notifications/notify.route.js";
import WFHRoute from "./src/module/wfh/wfh.route.js";
import LeaveRoute from "./src/module/leave/leave.route.js";
import categoryRoute from "./src/module/category/category.route.js";
import departmentRoute from "./src/module/department/department.route.js";
import masterroleRoute from "./src/module/role master/rolem.route.js";
import financeRoute from "./src/module/finance/finance.route.js";
import hospitalRevenueRoute from "./src/module/hospital/hospitalRevenue.route.js";
import doctorRevenueRoute from "./src/module/doctor/doctorRevenue.route.js";
import attendanceRoute from "./src/module/attendance/attendance.route.js";
import payrollRoute from "./src/module/payroll/payroll.route.js";
import reportRoute from "./src/module/reports/report.route.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

scheduleCronJobs();
scheduleCronWFH();
scheduleCronLeaveStatus();

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Add Morgan Middleware for Logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

logger.info("Server started successfully");

// ============================================
// ROUTES - CLEAN & NO DUPLICATES
// ============================================

app.use("/role", roleRoute);
app.use("/rolemaster", masterroleRoute);
app.use("/category", categoryRoute);  
app.use("/department", departmentRoute);
app.use("/employee", employeeRoute);
app.use("/appointment", appointmentRoute);
app.use("/task", taskRoute);
app.use("/campaign", campaignRoute);
app.use("/lead", leadRoute);
app.use("/doctor", doctorRoute);
app.use("/hospital", hospitalRoute);
app.use("/notify", notificationRoute);
app.use("/wfh", WFHRoute);
app.use("/leave", LeaveRoute);
app.use("/finance", financeRoute);
app.use("/hospital/revenue", hospitalRevenueRoute);
app.use("/doctor/revenue", doctorRevenueRoute);
app.use("/attendance", attendanceRoute);
app.use("/payroll", payrollRoute);
app.use("/reports", reportRoute);

// ============================================
// HOME ROUTE
// ============================================

app.get("/", (req, res) => {
  res.send(`Welcome to Optimum Backend`);
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✓ Server is running in port ${PORT}`);
});
