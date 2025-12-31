import { Schema, model } from "mongoose";
import crypto from "crypto";

const CertificateSchema = new Schema(
  {
    // Unique certificate ID for sharing/verification
    certificateId: {
      type: String,
      unique: true,
      required: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    instructorName: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
    },
    completionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Optional expiry for certain certifications
    expiryDate: {
      type: Date,
      default: null,
    },
    // Course duration in hours for display
    courseDuration: {
      type: String,
      default: "",
    },
    // Status of the certificate
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for faster queries
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Virtual for shareable URL
CertificateSchema.virtual("shareUrl").get(function () {
  return `/certificate/verify/${this.certificateId}`;
});

export default model("Certificate", CertificateSchema);
