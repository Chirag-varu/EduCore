import { Schema, model } from "mongoose";

const NewsletterSubscriptionSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionDate: {
      type: Date,
      default: Date.now,
    },
    unsubscriptionDate: {
      type: Date,
    },
    subscribedTopics: {
      type: [String],
      default: ["general"],
    },
    confirmationToken: {
      type: String,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Track metrics
    openCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create indexes for faster queries
NewsletterSubscriptionSchema.index({ email: 1 });
NewsletterSubscriptionSchema.index({ userId: 1 });
NewsletterSubscriptionSchema.index({ isActive: 1 });

export default model("NewsletterSubscription", NewsletterSubscriptionSchema);