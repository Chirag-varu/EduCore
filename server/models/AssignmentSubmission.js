import { Schema, model } from "mongoose";

const AssignmentSubmissionSchema = new Schema({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
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
  textSubmission: {
    type: String,
    trim: true
  },
  files: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned'],
    default: 'draft'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  score: {
    type: Number,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    general: String,
    rubricScores: [{
      criterionId: String,
      score: Number,
      maxScore: Number,
      feedback: String
    }]
  },
  isLate: {
    type: Boolean,
    default: false
  },
  daysLate: {
    type: Number,
    default: 0
  },
  latePenaltyApplied: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 1
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewReason: String,
  plagiarismScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
}, { timestamps: true });

// Calculate percentage when score is set
AssignmentSubmissionSchema.pre('save', function(next) {
  if (this.score !== undefined && this.maxScore) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }
  
  // Update lastModified when certain fields change
  if (this.isModified('textSubmission') || this.isModified('files')) {
    this.lastModified = new Date();
  }
  
  next();
});

// Compound indexes for efficient queries
AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
AssignmentSubmissionSchema.index({ courseId: 1, studentId: 1 });
AssignmentSubmissionSchema.index({ assignmentId: 1, status: 1 });
AssignmentSubmissionSchema.index({ submittedAt: 1 });

export default model("AssignmentSubmission", AssignmentSubmissionSchema);