import { Schema, model } from "mongoose";

const LectureSchema = new Schema(
  {
    title: { type: String, required: true },
    videoUrl: String,
    publicId: String,
    isPreviewFree: Boolean,
  },
  { timestamps: true }
);

export const Lecture = model("Lecture", LectureSchema);

const CourseSchema = new Schema(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: String,
    date: { type: Date, default: Date.now },
    title: { type: String, required: true },
    category: String,
    level: String,
    primaryLanguage: String,
    subtitle: String,
    description: String,
    image: String,
    welcomeMessage: String,
    pricing: Number,
    hours: { type: Number, default: 0 }, // Course duration in hours
    objectives: String,
    students: [
      {
        studentId: String,
        studentName: String,
        studentEmail: String,
        paidAmount: String,
      },
    ],
    curriculum: [{ type: Schema.Types.ObjectId, ref: "Lecture" }], // reference lectures
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Course", CourseSchema);
