import { Schema, model } from "mongoose";

const CourseCommentSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    // Optional fields
    userAvatar: String,
    title: String,
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create indexes for faster queries
CourseCommentSchema.index({ courseId: 1, createdAt: -1 }); 
CourseCommentSchema.index({ userId: 1 });

export default model("CourseComment", CourseCommentSchema);