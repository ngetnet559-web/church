import mongoose from "mongoose";
import { EXPENSE_CATEGORIES, EXPENSE_STATUS } from "../constants/finance.js";
import { PAYMENT_METHODS } from "../constants/finance.js";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      default: "Other",
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [1, "Expense amount must be at least 1"],
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "Other",
    },
    receiptImage: {
      type: String,
      default: "",
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: EXPENSE_STATUS,
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

expenseSchema.index({ status: 1, expenseDate: -1 });
expenseSchema.index({ category: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
