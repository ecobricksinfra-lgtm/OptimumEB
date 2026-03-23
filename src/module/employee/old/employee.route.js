// ====================================
// FILE: src/module/employee/employee.route.js
// UPDATED: Added getEmployeeByEmployeeId endpoint
// ====================================

import express from "express";
import {
  loginEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByEmployeeId,  // ✅ EXISTING
  updateEmployee,
  deleteEmployee,
  getEmployeesByStatus,
  getEmployeesByDepartment,
  searchEmployees,
  getEmployeeCount,
  updateEmployeeStatus,
  getEmployeeStatistics,
  editProfileByEmployeeId,      // ✅ NEW
  changePasswordByEmployeeId,   // ✅ NEW
} from "./employee.controller.js";

const router = express.Router();

// ✅ LOGIN EMPLOYEE (Must be before other routes)
router.post("/login", loginEmployee);

// ✅ CREATE EMPLOYEE
router.post("/create", createEmployee);

// ✅ GET ALL EMPLOYEES
router.get("/getallemployees", getAllEmployees);

// ✅ GET EMPLOYEE COUNT
router.get("/count", getEmployeeCount);

// ✅ GET EMPLOYEE STATISTICS
router.get("/statistics", getEmployeeStatistics);

// ✅ SEARCH EMPLOYEES
router.get("/search", searchEmployees);

// ✅ GET EMPLOYEES BY STATUS
router.get("/status/:status", getEmployeesByStatus);

// ✅ GET EMPLOYEES BY DEPARTMENT
router.get("/department/:department", getEmployeesByDepartment);

// ✅ GET EMPLOYEE BY EMPLOYEE_ID STRING (NEW - For Profile Page)
// Must be BEFORE /:id route!
router.get("/byemployeeid/:employee_id", getEmployeeByEmployeeId);

// ✅ PROFILE SECTION - NEW ROUTES (FOR LOGGED-IN USER ONLY)
// Must be BEFORE /:id route!
router.put("/profile/edit/:employee_id", editProfileByEmployeeId);
router.put("/profile/change-password/:employee_id", changePasswordByEmployeeId);

// ✅ GET EMPLOYEE BY MONGODB _ID
router.get("/:id", getEmployeeById);

// ✅ UPDATE EMPLOYEE STATUS
router.put("/:id/status", updateEmployeeStatus);

// ✅ UPDATE EMPLOYEE
router.put("/:id", updateEmployee);

// ✅ DELETE EMPLOYEE
router.delete("/:id", deleteEmployee);

export default router;
