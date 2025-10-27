import { Schema, model } from "mongoose";

const LectureSchema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Lecture title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    videoUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Video URL must be a valid URL'
      }
    },
    publicId: {
      type: String,
      trim: true
    },
    isPreviewFree: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // in minutes
      min: [0, 'Duration cannot be negative'],
      max: [600, 'Lecture duration cannot exceed 10 hours']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    order: {
      type: Number,
      min: [1, 'Order must be at least 1']
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Lecture = model("Lecture", LectureSchema);

const CourseSchema = new Schema(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    instructorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters']
    },
    date: { type: Date, default: Date.now },
    title: { 
      type: String, 
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
      index: true
    },
    level: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Level must be beginner, intermediate, or advanced'
      }
    },
    primaryLanguage: {
      type: String,
      trim: true,
      maxlength: [50, 'Language cannot exceed 50 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    image: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Image must be a valid URL'
      }
    },
    welcomeMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Welcome message cannot exceed 500 characters']
    },
    pricing: {
      type: Number,
      min: [0, 'Pricing cannot be negative'],
      max: [10000, 'Pricing cannot exceed $10,000']
    },
    hours: { 
      type: Number, 
      default: 0,
      min: [0, 'Hours cannot be negative'],
      max: [1000, 'Course hours cannot exceed 1000']
    },
    objectives: {
      type: String,
      trim: true,
      maxlength: [1000, 'Objectives cannot exceed 1000 characters']
    },
    students: [
      {
        studentId: {
          type: String,
          required: true
        },
        studentName: {
          type: String,
          required: true,
          trim: true
        },
        studentEmail: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          validate: {
            validator: function(v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
          }
        },
        paidAmount: {
          type: String,
          required: true
        },
        enrolledAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
    curriculum: [{ type: Schema.Types.ObjectId, ref: "Lecture" }], // reference lectures
    isPublished: { type: Boolean, default: false },
    moderationStatus: { 
      type: String, 
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Moderation status must be pending, approved, or rejected'
      },
      default: 'pending',
      index: true
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin note cannot exceed 500 characters']
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: Date,
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for student count
CourseSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

// Virtual for course status
CourseSchema.virtual('status').get(function() {
  if (this.moderationStatus === 'rejected') return 'rejected';
  if (this.moderationStatus === 'pending') return 'pending_approval';
  if (!this.isPublished) return 'draft';
  return 'published';
});

// Index for efficient queries
CourseSchema.index({ instructorId: 1, moderationStatus: 1 });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ isPublished: 1, moderationStatus: 1 });
CourseSchema.index({ createdAt: -1 });

// Methods
CourseSchema.methods.addStudent = function(studentData) {
  // Check if student already enrolled
  const existingStudent = this.students.find(
    student => student.studentEmail === studentData.studentEmail
  );
  
  if (existingStudent) {
    throw new Error('Student already enrolled in this course');
  }
  
  this.students.push(studentData);
  return this.save();
};

CourseSchema.methods.removeStudent = function(studentEmail) {
  this.students = this.students.filter(
    student => student.studentEmail !== studentEmail
  );
  return this.save();
};

CourseSchema.methods.approve = function(adminId) {
  this.moderationStatus = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  this.rejectedAt = undefined;
  this.rejectedBy = undefined;
  this.rejectionReason = undefined;
  return this.save();
};

CourseSchema.methods.reject = function(adminId, reason) {
  this.moderationStatus = 'rejected';
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason;
  this.approvedAt = undefined;
  this.approvedBy = undefined;
  this.isPublished = false;
  return this.save();
};

export default model("Course", CourseSchema);
