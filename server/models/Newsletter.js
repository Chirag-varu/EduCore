import { Schema, model } from "mongoose";

const NewsletterSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    sendDate: {
      type: Date,
    },
    scheduledDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    topic: {
      type: String,
      default: "general",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Stats
    recipientCount: {
      type: Number,
      default: 0,
    },
    openCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    bounceCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model("Newsletter", NewsletterSchema);