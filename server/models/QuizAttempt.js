import { Schema, model } from "mongoose";

const QuizAttemptSchema = new Schema({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    selectedAnswer: Schema.Types.Mixed, // Can be string, array of strings, or boolean
    isCorrect: Boolean,
    pointsAwarded: {
      type: Number,
      default: 0
    },
    timeSpent: Number // in seconds
  }],
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  score: {
    type: Number,
    default: 0 // percentage
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // total time in seconds
  },
  feedback: {
    type: String,
    default: ""
  },
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewReason: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

// Compound index for efficient queries
QuizAttemptSchema.index({ quizId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
QuizAttemptSchema.index({ courseId: 1, studentId: 1 });
QuizAttemptSchema.index({ quizId: 1, status: 1 });

export default model("QuizAttempt", QuizAttemptSchema);