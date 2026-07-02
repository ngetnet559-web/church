import mongoose from "mongoose";

const memberProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    middleName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },

    birthDate: Date,

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    region: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    emergencyContact: {
      name: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      relationship: {
        type: String,
        default: "",
      },
    },

    occupation: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    favoriteVerse: {
      type: String,
      default: "",
    },

    churchRole: {
      type: String,
      default: "",
      trim: true,
    },

    ministry: {
      type: String,
      default: "",
      trim: true,
    },

    joinedChurchDate: Date,

    baptized: {
      type: Boolean,
      default: false,
    },

    baptismDate: Date,

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Visitor",
        "Transferred",
        "Suspended",
      ],
      default: "Active",
    },

    skills: [
      {
        type: String,
      },
    ],

    talents: [
      {
        type: String,
      },
    ],

    interests: [
      {
        type: String,
      },
    ],

    languages: [
      {
        type: String,
      },
    ],

    guardian: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relationship: { type: String, default: "" },
    },

    parentUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    attendanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completedCourses: {
      type: Number,
      default: 0,
      min: 0,
    },

    certificatesEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    donationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    volunteerHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    badges: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        icon: { type: String, default: "" },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        category: { type: String, default: "General" },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    ministries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ministry",
      },
    ],

    socialLinks: {
      facebook: String,
      telegram: String,
      instagram: String,
      youtube: String,
      website: String,
    },

    visibility: {
      type: String,
      enum: ["Private", "Members", "Public"],
      default: "Members",
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    auditTrail: [
      {
        action: {
          type: String,
          enum: ["CREATE", "UPDATE"],
          required: true,
        },
        changedFields: [
          {
            type: String,
          },
        ],
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

memberProfileSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;

  const diff = Date.now() - this.birthDate.getTime();

  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
});

memberProfileSchema.set("toJSON", {
  virtuals: true,
});

memberProfileSchema.set("toObject", {
  virtuals: true,
});

const MemberProfile = mongoose.model(
  "MemberProfile",
  memberProfileSchema
);

export default MemberProfile;
