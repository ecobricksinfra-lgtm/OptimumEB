// ====================================
// FILE: src/module/payroll/payroll.controller.js
// COMPLETE PAYROLL CONTROLLER
// ====================================

import Payroll from "./payroll.model.js";
import Employee from "../employee/employee.model.js";

// ✅ GENERATE PAYROLL FOR ALL EMPLOYEES
export const generatePayroll = async (req, res) => {
  try {
    console.log("📥 API Call: POST /api/payroll/generate");
    console.log("Request Body:", req.body);

    const { month, year } = req.body;

    // ✅ VALIDATION
    if (!month || !year) {
      return res.status(400).json({
        status: false,
        message: "Month and year are required",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        status: false,
        message: "Invalid month (1-12)",
      });
    }

    // ✅ CHECK IF PAYROLL ALREADY EXISTS FOR THIS MONTH
    const existingPayroll = await Payroll.countDocuments({ month, year });
    if (existingPayroll > 0) {
      return res.status(400).json({
        status: false,
        message: `Payroll for ${month}/${year} already exists. (${existingPayroll} records)`,
      });
    }

    // ✅ GET ALL ACTIVE EMPLOYEES
    const employees = await Employee.find({ status: "Active" });

    console.log("📥 Found", employees.length, "active employees");

    if (employees.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No active employees found",
      });
    }

    // ✅ GENERATE PAYROLL FOR EACH EMPLOYEE
    const payrollRecords = employees.map((emp) => {
      const basicSalary = emp.ctc ? emp.ctc / 12 : 0; // Monthly basic = CTC / 12
      const hra = basicSalary * 0.5; // HRA = 50% of basic
      const da = basicSalary * 0.1; // DA = 10% of basic
      const grossSalary = basicSalary + hra + da;

      // ✅ DEDUCTIONS (30% tax assumption)
      const incomeTax = grossSalary * 0.1; // 10% income tax
      const pf = grossSalary * 0.12; // 12% provident fund
      const totalDeductions = incomeTax + pf;

      // ✅ NET SALARY
      const netSalary = grossSalary - totalDeductions;

      return {
        employee_id: emp._id,
        employee_name: emp.name,
        employee_id_str: emp.employeeId,
        month,
        year,
        basic_salary: Math.round(basicSalary),
        hra: Math.round(hra),
        dearness_allowance: Math.round(da),
        other_allowances: 0,
        gross_salary: Math.round(grossSalary),
        income_tax: Math.round(incomeTax),
        provident_fund: Math.round(pf),
        other_deductions: 0,
        total_deductions: Math.round(totalDeductions),
        net_salary: Math.round(netSalary),
        working_days: 22,
        days_present: 20,
        days_absent: 2,
        leaves_taken: 0,
        status: "GENERATED",
        payment_method: "BANK_TRANSFER",
        generated_by: "HR",
        notes: `Auto-generated payroll for ${month}/${year}`,
      };
    });

    // ✅ INSERT ALL PAYROLL RECORDS
    const createdPayroll = await Payroll.insertMany(payrollRecords);

    console.log("✅ Payroll generated:", createdPayroll.length, "records");

    return res.status(201).json({
      status: true,
      message: `Payroll generated for ${createdPayroll.length} employees`,
      data: {
        month,
        year,
        total_employees: createdPayroll.length,
        total_gross: createdPayroll.reduce((sum, p) => sum + p.gross_salary, 0),
        total_deductions: createdPayroll.reduce((sum, p) => sum + p.total_deductions, 0),
        total_net: createdPayroll.reduce((sum, p) => sum + p.net_salary, 0),
      },
    });
  } catch (error) {
    console.error("❌ Error generating payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to generate payroll",
    });
  }
};

// ✅ GET ALL PAYROLL RECORDS
export const getAllPayroll = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/payroll/list");

    const payroll = await Payroll.find()
      .populate("employee_id", "name email jobTitle department")
      .sort({ year: -1, month: -1 });

    console.log("✅ Payroll records fetched:", payroll.length);

    return res.status(200).json({
      status: true,
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error fetching payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch payroll",
    });
  }
};

// ✅ GET PAYROLL BY ID
export const getPayrollById = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/payroll/:id");
    console.log("Payroll ID:", req.params.id);

    const { id } = req.params;

    const payroll = await Payroll.findById(id).populate(
      "employee_id",
      "name email jobTitle department employeeId"
    );

    if (!payroll) {
      return res.status(404).json({
        status: false,
        message: "Payroll record not found",
      });
    }

    console.log("✅ Payroll found:", id);

    return res.status(200).json({
      status: true,
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error fetching payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch payroll",
    });
  }
};

// ✅ GET PAYROLL BY MONTH & YEAR
export const getPayrollByMonth = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/payroll/month/:month/:year");
    const { month, year } = req.params;

    const payroll = await Payroll.find({
      month: parseInt(month),
      year: parseInt(year),
    })
      .populate("employee_id", "name email jobTitle department")
      .sort({ employee_name: 1 });

    console.log("✅ Payroll for", month, "/", year, "fetched:", payroll.length);

    return res.status(200).json({
      status: true,
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error fetching payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch payroll",
    });
  }
};

// ✅ GET PAYROLL BY EMPLOYEE
export const getPayrollByEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/payroll/employee/:employeeId");
    const { employeeId } = req.params;

    const payroll = await Payroll.find({ employee_id: employeeId })
      .populate("employee_id", "name email jobTitle department")
      .sort({ year: -1, month: -1 });

    console.log("✅ Payroll for employee fetched:", payroll.length);

    return res.status(200).json({
      status: true,
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error fetching payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch payroll",
    });
  }
};

// ✅ UPDATE PAYROLL
export const updatePayroll = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/payroll/:id");
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!payroll) {
      return res.status(404).json({
        status: false,
        message: "Payroll record not found",
      });
    }

    console.log("✅ Payroll updated:", id);

    return res.status(200).json({
      status: true,
      message: "Payroll updated successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error updating payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update payroll",
    });
  }
};

// ✅ APPROVE PAYROLL
export const approvePayroll = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/payroll/:id/approve");
    const { id } = req.params;
    const { approved_by } = req.body;

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        status: false,
        message: "Payroll record not found",
      });
    }

    payroll.status = "APPROVED";
    payroll.approved_by = approved_by || "HR";
    payroll.approved_date = new Date();

    await payroll.save();

    console.log("✅ Payroll approved:", id);

    return res.status(200).json({
      status: true,
      message: "Payroll approved successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error approving payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to approve payroll",
    });
  }
};

// ✅ MARK PAYROLL AS PAID
export const markPayrollAsPaid = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/payroll/:id/paid");
    const { id } = req.params;
    const { payment_date, payment_method } = req.body;

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        status: false,
        message: "Payroll record not found",
      });
    }

    payroll.status = "PAID";
    payroll.payment_date = payment_date || new Date();
    payroll.payment_method = payment_method || "BANK_TRANSFER";

    await payroll.save();

    console.log("✅ Payroll marked as paid:", id);

    return res.status(200).json({
      status: true,
      message: "Payroll marked as paid successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error marking payroll as paid:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to mark payroll as paid",
    });
  }
};

// ✅ DELETE PAYROLL
export const deletePayroll = async (req, res) => {
  try {
    console.log("📥 API Call: DELETE /api/payroll/:id");
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndDelete(id);

    if (!payroll) {
      return res.status(404).json({
        status: false,
        message: "Payroll record not found",
      });
    }

    console.log("✅ Payroll deleted:", id);

    return res.status(200).json({
      status: true,
      message: "Payroll deleted successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error deleting payroll:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete payroll",
    });
  }
};

// ✅ GET PAYROLL STATISTICS
export const getPayrollStatistics = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/payroll/statistics");

    const totalPayroll = await Payroll.countDocuments();
    const paidPayroll = await Payroll.countDocuments({ status: "PAID" });
    const approvedPayroll = await Payroll.countDocuments({ status: "APPROVED" });
    const generatedPayroll = await Payroll.countDocuments({ status: "GENERATED" });

    const aggregatedData = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalGross: { $sum: "$gross_salary" },
          totalDeductions: { $sum: "$total_deductions" },
          totalNet: { $sum: "$net_salary" },
        },
      },
    ]);

    const stats = aggregatedData[0] || {
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
    };

    console.log("✅ Payroll statistics fetched");

    return res.status(200).json({
      status: true,
      message: "Payroll statistics fetched successfully",
      data: {
        counts: {
          total: totalPayroll,
          paid: paidPayroll,
          approved: approvedPayroll,
          generated: generatedPayroll,
        },
        totals: stats,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
export default {
  generatePayroll,
  getAllPayroll,
  getPayrollById,
  getPayrollByMonth,
  getPayrollByEmployee,
  updatePayroll,
  approvePayroll,
  markPayrollAsPaid,
  deletePayroll,
  getPayrollStatistics,
};
