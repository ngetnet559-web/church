import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Budget title is required"],
      trim: true,
    },
    fiscalYear: {
      type: String,
      required: [true, "Fiscal year is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    allocatedAmount: {
      type: Number,
      required: [true, "Allocated amount is required"],
      min: [0, "Allocated amount cannot be negative"],
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    warningThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
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

budgetSchema.pre("save", function (next) {
  this.remainingAmount = Math.max(0, this.allocatedAmount - this.spentAmount);
  next();
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
