import { Schema, model } from "mongoose";

const AssignmentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
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
  lectureId: {
    type: Schema.Types.ObjectId,
    ref: "Lecture",
    default: null // Optional - can be linked to a specific lecture
  },
  settings: {
    dueDate: {
      type: Date,
      required: true
    },
    maxPoints: {
      type: Number,
      required: true,
      min: 1
    },
    allowLateSubmission: {
      type: Boolean,
      default: false
    },
    latePenalty: {
      type: Number,
      default: 0, // percentage deduction per day
      min: 0,
      max: 100
    },
    allowedFileTypes: [{
      type: String, // e.g., 'pdf', 'doc', 'docx', 'txt'
    }],
    maxFileSize: {
      type: Number,
      default: 10 // in MB
    },
    maxFiles: {
      type: Number,
      default: 1
    },
    requireTextSubmission: {
      type: Boolean,
      default: false
    },
    availableFrom: {
      type: Date,
      default: Date.now
    }
  },
  rubric: [{
    criterion: String,
    description: String,
    maxPoints: Number,
    levels: [{
      name: String, // e.g., "Excellent", "Good", "Fair", "Poor"
      description: String,
      points: Number
    }]
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isRequired: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default model("Assignment", AssignmentSchema);