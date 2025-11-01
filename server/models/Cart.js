import { Schema, model } from "mongoose";

const CartItemSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  courseTitle: {
    type: String,
    required: true,
    trim: true
  },
  courseImage: {
    type: String,
    required: true
  },
  coursePrice: {
    type: Number,
    required: true,
    min: [0, 'Course price cannot be negative']
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative']
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total price cannot be negative']
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware to update totals before saving
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.totalPrice = this.items.reduce((total, item) => total + item.coursePrice, 0);
  this.lastModified = new Date();
  next();
});

// Instance methods
CartSchema.methods.addItem = function(courseData) {
  // Check if course already exists in cart
  const existingItemIndex = this.items.findIndex(
    item => item.courseId.toString() === courseData.courseId.toString()
  );
  
  if (existingItemIndex > -1) {
    throw new Error('Course already exists in cart');
  }
  
  this.items.push({
    courseId: courseData.courseId,
    courseTitle: courseData.courseTitle,
    courseImage: courseData.courseImage,
    coursePrice: courseData.coursePrice,
    instructorId: courseData.instructorId,
    instructorName: courseData.instructorName
  });
  
  return this.save();
};

CartSchema.methods.removeItem = function(courseId) {
  this.items = this.items.filter(
    item => item.courseId.toString() !== courseId.toString()
  );
  return this.save();
};

CartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

CartSchema.methods.isItemInCart = function(courseId) {
  return this.items.some(
    item => item.courseId.toString() === courseId.toString()
  );
};

// Static methods
CartSchema.statics.findCartByUserId = function(userId) {
  // Populate with fields that exist on Course model
  return this.findOne({ userId }).populate('items.courseId', 'title pricing image instructorName');
};

CartSchema.statics.createCartForUser = function(userId) {
  return this.create({ userId, items: [] });
};

// Indexes for better performance
CartSchema.index({ 'items.courseId': 1 });
CartSchema.index({ lastModified: -1 });

export default model("Cart", CartSchema);