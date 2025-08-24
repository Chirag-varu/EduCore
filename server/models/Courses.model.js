import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    instructorName: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    category: { type: String },
    language: { type: String }, 
    level: { type: String },
    thumbnail: { type: String }, // image URL or Cloudinary ID
    promotionalVideo: { type: String }, // video URL or Cloudinary ID
    price: { type: Number, default: 0 },
    freePreview: { type: Boolean, default: false },
    certificate: { type: Boolean, default: true },
    lifetime: { type: Boolean, default: true },
    objectives: { type: String },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    curriculum: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    isPublised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", CourseSchema);
