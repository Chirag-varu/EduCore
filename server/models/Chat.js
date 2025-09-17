import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const ChatSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    messages: [MessageSchema],
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create indexes for faster queries
ChatSchema.index({ courseId: 1, studentId: 1, instructorId: 1 });
ChatSchema.index({ instructorId: 1 });
ChatSchema.index({ studentId: 1 });

export default model("Chat", ChatSchema);