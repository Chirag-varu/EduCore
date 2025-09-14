import CourseComment from "../../models/CourseComment.js";

// Get all comments for a specific course
const getCourseComments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const comments = await CourseComment.find({ 
      courseId, 
      isPublished: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error retrieving course comments",
    });
  }
};

// Add a new comment to a course
const addCourseComment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, userName, rating, comment, title, userAvatar } = req.body;

    // Basic validation
    if (!courseId || !userId || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user has already commented on this course
    const existingComment = await CourseComment.findOne({
      courseId,
      userId,
    });

    if (existingComment) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a comment for this course",
      });
    }
    
    // Verify that the user has purchased/enrolled in the course
    const Course = (await import("../../models/Course.js")).default;
    const StudentCourses = (await import("../../models/StudentCourses.js")).default;
    
    // Check if the user is enrolled through either Course enrollment or StudentCourses
    const isEnrolled = await Course.findOne({
      _id: courseId,
      enrolledStudents: { $elemMatch: { $eq: userId } }
    });
    
    const hasAccess = await StudentCourses.findOne({
      userId,
      courses: { $elemMatch: { courseId } }
    });
    
    if (!isEnrolled && !hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to leave a review",
      });
    }

    const newComment = new CourseComment({
      courseId,
      userId,
      userName,
      rating,
      comment,
      title,
      userAvatar,
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: savedComment,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error adding course comment",
    });
  }
};

// Update an existing comment
const updateCourseComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { rating, comment, title } = req.body;
    
    // Find the comment
    const existingComment = await CourseComment.findById(commentId);
    
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    
    // Check if user owns the comment (could be part of auth middleware)
    if (existingComment.userId.toString() !== req.body.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment",
      });
    }
    
    // Update fields
    if (rating) existingComment.rating = rating;
    if (comment) existingComment.comment = comment;
    if (title) existingComment.title = title;
    existingComment.isEdited = true;
    
    const updatedComment = await existingComment.save();
    
    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error updating course comment",
    });
  }
};

// Delete a comment
const deleteCourseComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Find the comment
    const existingComment = await CourseComment.findById(commentId);
    
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    
    // Check if user owns the comment (could be part of auth middleware)
    if (existingComment.userId.toString() !== req.body.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }
    
    await CourseComment.findByIdAndDelete(commentId);
    
    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error deleting course comment",
    });
  }
};

// Get comments by user
const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await CourseComment.find({ 
      userId, 
      isPublished: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error retrieving user comments",
    });
  }
};

export default {
  getCourseComments,
  addCourseComment,
  updateCourseComment,
  deleteCourseComment,
  getUserComments,
};