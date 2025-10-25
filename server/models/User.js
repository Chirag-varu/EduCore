import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  userName: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be at least 2 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  userEmail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  resetToken: { 
    type: String,
    default: null
  },
  resetTokenExpiry: { 
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
UserSchema.index({ userEmail: 1 });
UserSchema.index({ resetToken: 1 });

export default model("User", UserSchema);
