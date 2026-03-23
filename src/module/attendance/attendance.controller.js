import AttendanceModel from "./attendance.model.js";
import EmployeeModel from "../employee/employee.model.js";

// Check in
export const checkIn = async (req, res) => {
  try {
    const { employee_id } = req.body;

    // ✅ FIXED: Use findOne with string employee_id, not findById with ObjectId
    const employee = await EmployeeModel.findOne({ employee_id: employee_id });
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await AttendanceModel.findOne({
      employee_id,
      date: { $gte: today },
    });

    if (attendance) {
      return res.status(400).json({
        status: false,
        message: "Already checked in today",
      });
    }

    // Create new attendance
    const count = await AttendanceModel.countDocuments();
    const attendance_id = `ATT-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
      count + 1
    ).padStart(4, "0")}`;

    attendance = await AttendanceModel.create({
      attendance_id,
      employee_id,
      employee_name: employee.name,
      date: new Date(),
      check_in_time: new Date(),
      status: "PRESENT",
    });

    res.status(201).json({
      status: true,
      message: "Checked in successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Check in error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Check out
export const checkOut = async (req, res) => {
  try {
    const { employee_id } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await AttendanceModel.findOne({
      employee_id,
      date: { $gte: today },
    });

    if (!attendance) {
      return res.status(404).json({
        status: false,
        message: "No check-in found for today",
      });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({
        status: false,
        message: "Already checked out",
      });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.check_in_time);
    const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    attendance.check_out_time = checkOutTime;
    attendance.work_hours = parseFloat(workHours.toFixed(2));

    await attendance.save();

    res.status(200).json({
      status: true,
      message: "Checked out successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Check out error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Manual attendance entry
export const manualAttendance = async (req, res) => {
  try {
    const { employee_id, date, status, remarks } = req.body;

    if (!employee_id || !date || !status) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    // ✅ FIXED: Use findOne with string employee_id, not findById with ObjectId
    const employee = await EmployeeModel.findOne({ employee_id: employee_id });
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if already exists
    let attendance = await AttendanceModel.findOne({
      employee_id,
      date: attendanceDate,
    });

    if (attendance) {
      // Update existing
      attendance.status = status;
      attendance.remarks = remarks;
      await attendance.save();
    } else {
      // Create new
      const count = await AttendanceModel.countDocuments();
      const attendance_id = `ATT-${attendanceDate.toISOString().slice(0, 7).replace("-", "")}-${String(
        count + 1
      ).padStart(4, "0")}`;

      attendance = await AttendanceModel.create({
        attendance_id,
        employee_id,
        employee_name: employee.name,
        date: attendanceDate,
        status,
        remarks,
      });
    }

    res.status(200).json({
      status: true,
      message: "Attendance marked",
      data: attendance,
    });
  } catch (error) {
    console.error("Manual attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get monthly attendance
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { month } = req.params;
    // month format: YYYY-MM

    const [year, monthNum] = month.split("-");
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const attendance = await AttendanceModel.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ date: 1 });

    // Ensure employee_name is set
    const attendanceWithNames = attendance.map(att => {
      const attObj = att.toObject();
      if (!attObj.employee_name && attObj.employee_id) {
        attObj.employee_name = attObj.employee_id.name;
      }
      return attObj;
    });

    res.status(200).json({
      status: true,
      data: attendanceWithNames,
    });
  } catch (error) {
    console.error("Get monthly attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get employee attendance
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { month } = req.query;

    let query = { employee_id };

    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(`${year}-${monthNum}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const attendance = await AttendanceModel.find(query).sort({ date: -1 });

    res.status(200).json({
      status: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get employee attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await AttendanceModel.findByIdAndUpdate(
      attendance_id,
      { status, remarks },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({
        status: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Attendance updated",
      data: attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const { attendance_id } = req.params;

    const attendance = await AttendanceModel.findByIdAndDelete(attendance_id);

    if (!attendance) {
      return res.status(404).json({
        status: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Attendance deleted",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
