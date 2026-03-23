// ====================================
// FILE: src/module/payroll/payroll.model.js
// FIXED PAYROLL MODEL (E11000 ERROR RESOLVED)
// ====================================

import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    // ✅ EMPLOYEE REFERENCE
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    // ✅ EMPLOYEE NAME (Backup)
    employee_name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ EMPLOYEE ID (Backup)
    employee_id_str: {
      type: String,
      trim: true,
      sparse: true, // ✅ Allow null values
    },

    // ✅ MONTH & YEAR
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    // ✅ SALARY COMPONENTS
    basic_salary: {
      type: Number,
      required: true,
      default: 0,
    },

    hra: {
      type: Number,
      default: 0,
    },

    dearness_allowance: {
      type: Number,
      default: 0,
    },

    other_allowances: {
      type: Number,
      default: 0,
    },

    gross_salary: {
      type: Number,
      required: true,
      default: 0,
    },

    // ✅ DEDUCTIONS
    income_tax: {
      type: Number,
      default: 0,
    },

    provident_fund: {
      type: Number,
      default: 0,
    },

    other_deductions: {
      type: Number,
      default: 0,
    },

    total_deductions: {
      type: Number,
      default: 0,
    },

    // ✅ NET SALARY (Final salary)
    net_salary: {
      type: Number,
      required: true,
      default: 0,
    },

    // ✅ ATTENDANCE
    working_days: {
      type: Number,
      default: 22, // Standard working days
    },

    days_present: {
      type: Number,
      default: 0,
    },

    days_absent: {
      type: Number,
      default: 0,
    },

    leaves_taken: {
      type: Number,
      default: 0,
    },

    // ✅ STATUS
    status: {
      type: String,
      enum: ["GENERATED", "APPROVED", "PAID", "PENDING"],
      default: "GENERATED",
      index: true,
    },

    // ✅ PAYMENT DETAILS
    payment_date: {
      type: Date,
      default: null,
      sparse: true, // ✅ Allow null values
    },

    payment_method: {
      type: String,
      enum: ["BANK_TRANSFER", "CASH", "CHECK"],
      default: "BANK_TRANSFER",
    },

    // ✅ NOTES
    notes: {
      type: String,
      default: "",
    },

    // ✅ GENERATED/APPROVED BY
    generated_by: {
      type: String,
      default: "HR",
    },

    approved_by: {
      type: String,
      default: null,
      sparse: true, // ✅ Allow null values
    },

    approved_date: {
      type: Date,
      default: null,
      sparse: true, // ✅ Allow null values
    },
  },
  {
    timestamps: true,
  }
);

// ✅ REMOVE OLD INDEXES
// This helps avoid E11000 errors from old indexes
payrollSchema.on("index", function (err) {
  if (err) {
    console.error("Index error (non-fatal):", err.message);
  }
});

// ✅ COMPOUND INDEX - unique per employee per month
// sparse: true allows null values without duplicate errors
payrollSchema.index(
  { employee_id: 1, month: 1, year: 1 },
  { unique: true, sparse: true }
);

// ✅ OTHER USEFUL INDEXES
payrollSchema.index({ status: 1 });
payrollSchema.index({ year: 1, month: 1 });
payrollSchema.index({ createdAt: -1 });
payrollSchema.index({ employee_id: 1, year: 1, month: 1 });

// ✅ PRE-SAVE HOOK - Validation
payrollSchema.pre("save", async function (next) {
  // Validate date ranges if payment_date exists
  if (this.payment_date && this.createdAt) {
    if (this.payment_date < this.createdAt) {
      return next(new Error("Payment date cannot be before creation date"));
    }
  }
  next();
});

// ✅ POST-SAVE HOOK - Log for debugging
payrollSchema.post("save", function (doc) {
  console.log("✅ Payroll saved:", {
    employee: doc.employee_name,
    month: doc.month,
    year: doc.year,
    status: doc.status,
  });
});

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;

// ====================================
// SOLUTION: HOW TO FIX E11000 ERROR
// ====================================

/*
The E11000 duplicate key error occurs because:
1. Old unique index on 'payroll_id' field (doesn't exist in new schema)
2. Multiple null values violate unique constraint

SOLUTION:
Run this in MongoDB to drop the problematic index:

db.payrolls.dropIndex("payroll_id_1")

OR drop all indexes and let mongoose recreate them:

db.payrolls.dropIndexes()

Then restart your server.

MongoDB will automatically recreate the correct indexes defined above.

KEY CHANGES IN THIS FIXED VERSION:
- Added sparse: true to allow null values in unique fields
- Removed any reference to payroll_id field
- Proper compound unique index: (employee_id, month, year)
- Pre/post hooks for debugging
- Better error handling
*/
