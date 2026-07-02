import mongoose from "mongoose";

const parentPortalAccessSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

parentPortalAccessSchema.index({ parentId: 1, childId: 1 }, { unique: true });

const ParentPortalAccess = mongoose.model(
  "ParentPortalAccess",
  parentPortalAccessSchema,
);

export default ParentPortalAccess;
